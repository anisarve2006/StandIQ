from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from typing import Dict, Any

from schemas.auth import UserCreate, UserResponse
from services.auth_service import AuthService, AuthException
from dependencies.auth import get_auth_service, get_current_user
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

def set_refresh_cookie(response: Response, refresh_token: str):
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=refresh_token,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite=settings.auth_cookie_samesite,
        path="/auth",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60
    )

def clear_refresh_cookie(response: Response):
    response.delete_cookie(
        key=settings.auth_cookie_name,
        path="/auth",
        secure=settings.auth_cookie_secure,
        httponly=True,
        samesite=settings.auth_cookie_samesite
    )

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, auth_service: AuthService = Depends(get_auth_service)):
    try:
        return auth_service.register(
            email=user_in.email, 
            password=user_in.password, 
            full_name=user_in.full_name
        )
    except AuthException as e:
        if "already exists" in e.message:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)

@router.post("/login")
def login(user_in: UserCreate, response: Response, auth_service: AuthService = Depends(get_auth_service)):
    # Note: user_in for login usually just needs email and password. Reusing UserCreate works since it has both.
    # In a real app we might use OAuth2PasswordRequestForm, but we match the requested JSON spec here.
    try:
        result = auth_service.login(email=user_in.email, password=user_in.password)
    except AuthException as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.message)
        
    set_refresh_cookie(response, result["refresh_token"])
    
    return {
        "access_token": result["access_token"],
        "token_type": "bearer",
        "user": result["user"]
    }

@router.post("/refresh")
def refresh(request: Request, response: Response, auth_service: AuthService = Depends(get_auth_service)):
    refresh_token = request.cookies.get(settings.auth_cookie_name)
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")
        
    try:
        result = auth_service.refresh(refresh_token)
    except AuthException as e:
        clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.message)
        
    set_refresh_cookie(response, result["refresh_token"])
    return {
        "access_token": result["access_token"],
        "token_type": "bearer"
    }

@router.post("/logout")
def logout(request: Request, response: Response, auth_service: AuthService = Depends(get_auth_service)):
    refresh_token = request.cookies.get(settings.auth_cookie_name)
    if refresh_token:
        try:
            auth_service.logout(refresh_token)
        except AuthException:
            pass # safe to ignore
    clear_refresh_cookie(response)
    return {"status": "success"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

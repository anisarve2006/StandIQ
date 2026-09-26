import os

class Settings:
    application_env: str = os.getenv("APPLICATION_ENV", "DEVELOPMENT")
    postgres_host: str = os.getenv("POSTGRES_HOST", "localhost")
    postgres_port: int = int(os.getenv("POSTGRES_PORT", "5432"))
    postgres_db: str = os.getenv("POSTGRES_DB", "maanakai")
    postgres_user: str = os.getenv("POSTGRES_USER", "postgres")
    postgres_password: str = os.getenv("POSTGRES_PASSWORD", "password")
    db_path: str = os.getenv("DB_PATH", "data/standards.db")
    qdrant_host: str = os.getenv("QDRANT_HOST", "localhost")
    qdrant_port: int = int(os.getenv("QDRANT_PORT", "6333"))
    qdrant_collection: str = os.getenv("QDRANT_COLLECTION", "standards")
    neo4j_uri: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    neo4j_user: str = os.getenv("NEO4J_USER", "neo4j")
    neo4j_password: str = os.getenv("NEO4J_PASSWORD", "password")
    use_groq: bool = os.getenv("USE_GROQ", "false").lower() == "true"
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    use_bharatgpt: bool = os.getenv("USE_BHARATGPT", "true").lower() == "true"
    bharatgpt_model_path: str = os.getenv("BHARATGPT_MODEL_PATH", "BharatGPT-3B-Indic.Q8_0.gguf")

settings = Settings()

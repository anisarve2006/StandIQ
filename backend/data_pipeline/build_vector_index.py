"""
Builds precomputed dense vector index (standards_vector_index.npz) using FastEmbed.
Computes 384-dimensional embeddings across title, scope, and division in high-speed batches.
"""

import os
import sqlite3
import numpy as np
from fastembed import TextEmbedding

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DB_PATH = os.path.join(DATA_DIR, "standards.db")
OUTPUT_NPZ = os.path.join(DATA_DIR, "standards_vector_index.npz")

def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT family_id, title_en, scope_text, division FROM standards ORDER BY family_id")
    rows = cur.fetchall()
    conn.close()

    print(f"Loading FastEmbed BGE model to index {len(rows)} standards...")
    embedder = TextEmbedding("BAAI/bge-small-en-v1.5")

    fids = []
    texts = []
    for r in rows:
        fid, title, scope, div = r
        scope_str = f" Scope: {scope}" if scope and len(scope) > 5 else ""
        div_str = f" Division: {div}" if div else ""
        doc_text = f"{title}.{scope_str}{div_str}".strip()
        fids.append(fid)
        texts.append(doc_text)

    # Compute in batches
    embeddings = list(embedder.embed(texts, batch_size=64))
    matrix = np.array(embeddings, dtype=np.float32)

    # Normalize vectors to unit length for fast dot product cosine similarity
    norms = np.linalg.norm(matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    normalized_matrix = matrix / norms

    np.savez_compressed(
        OUTPUT_NPZ,
        family_ids=np.array(fids, dtype=object),
        vectors=normalized_matrix
    )
    print(f"Successfully generated {OUTPUT_NPZ} with shape {normalized_matrix.shape}!")

if __name__ == "__main__":
    main()

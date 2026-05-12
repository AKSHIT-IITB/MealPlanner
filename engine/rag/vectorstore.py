import chromadb
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
import httpx
from config import EXPRESS_API_URL, CHROMA_PATH

# setup chroma with persistent storage so we dont lose embeddings on restart
chroma = chromadb.PersistentClient(path=CHROMA_PATH)
ef = DefaultEmbeddingFunction()
collection = chroma.get_or_create_collection("meals", embedding_function=ef)


async def sync_meals():
    # fetch all meals from the express server
    async with httpx.AsyncClient(timeout=10.0) as client:
        res = await client.get(EXPRESS_API_URL + "/meals/sync-source")
        res.raise_for_status()
        data = res.json()

    docs = []
    ids = []
    metas = []

    for meal_type in ["breakfast", "lunch", "dinner"]:
        for meal in data.get(meal_type, []):
            docs.append(meal["name"] + ": " + meal["desc"])
            ids.append(str(meal["_id"]))
            metas.append({
                "type": meal_type,
                "name": meal["name"],
                "desc": meal["desc"],
            })

    if docs:
        collection.upsert(documents=docs, ids=ids, metadatas=metas)
        print(f"Synced {len(docs)} meals to ChromaDB")

    return len(docs)


def search_meals(query, meal_type=None, n=5):
    total = collection.count()
    if total == 0:
        return []

    params = {
        "query_texts": [query],
        "n_results": min(n, total)
    }

    if meal_type:
        params["where"] = {"type": meal_type}

    try:
        results = collection.query(**params)
        meals = []
        for m in results["metadatas"][0]:
            meals.append({
                "name": m["name"],
                "desc": m["desc"],
                "type": m["type"]
            })
        return meals
    except Exception as e:
        print(f"search failed: {e}")
        return []

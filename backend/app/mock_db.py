import uuid
from datetime import datetime

class MockUpdateResult:
    def __init__(self, modified_count=1, matched_count=1):
        self.modified_count = modified_count
        self.matched_count = matched_count

class MockDeleteResult:
    def __init__(self, deleted_count=1):
        self.deleted_count = deleted_count

class MockCursor:
    def __init__(self, data):
        self.data = data
        self._limit = None

    def sort(self, key, direction=1):
        # Sort data if needed, basic sorting by date/timestamp
        try:
            if key == "created_at":
                self.data.sort(key=lambda x: x.get("created_at", datetime.min), reverse=(direction == -1))
        except Exception:
            pass
        return self

    def limit(self, num):
        self._limit = num
        return self

    async def to_list(self, length):
        limit = self._limit or len(self.data)
        return self.data[:limit]

class MockCollection:
    def __init__(self, name):
        self.name = name
        self.documents = []

    async def insert_one(self, doc):
        # Avoid modifying original dictionary directly if possible
        doc = doc.copy()
        if "_id" not in doc:
            doc["_id"] = str(uuid.uuid4())
        if "created_at" not in doc:
            doc["created_at"] = datetime.utcnow()
        self.documents.append(doc)
        class Result:
            inserted_id = doc["_id"]
        return Result()

    async def insert_many(self, docs):
        for doc in docs:
            await self.insert_one(doc)
        return True

    def _match_doc(self, doc, query):
        for k, v in query.items():
            if isinstance(v, dict):
                val = doc.get(k)
                if val is None:
                    return False
                # Attempt to parse ISO dates if comparing string to datetime
                if isinstance(val, str) and isinstance(next(iter(v.values())), datetime):
                    try:
                        val = datetime.fromisoformat(val.replace("Z", "+00:00"))
                    except Exception:
                        pass
                for op, op_val in v.items():
                    if op == "$gte" and not (val >= op_val):
                        return False
                    elif op == "$lte" and not (val <= op_val):
                        return False
                    elif op == "$gt" and not (val > op_val):
                        return False
                    elif op == "$lt" and not (val < op_val):
                        return False
            else:
                if doc.get(k) != v:
                    return False
        return True

    async def find_one(self, query):
        for doc in self.documents:
            if self._match_doc(doc, query):
                return doc
        return None

    def find(self, query):
        results = [doc for doc in self.documents if self._match_doc(doc, query)]
        return MockCursor(results)

    async def update_one(self, query, update, upsert=False):
        doc = await self.find_one(query)
        if not doc:
            if upsert:
                new_doc = query.copy()
                if "$set" in update:
                    new_doc.update(update["$set"])
                await self.insert_one(new_doc)
                return MockUpdateResult(modified_count=1, matched_count=1)
            return MockUpdateResult(modified_count=0, matched_count=0)
        
        if "$set" in update:
            for k, v in update["$set"].items():
                doc[k] = v
        if "$inc" in update:
            for k, v in update["$inc"].items():
                doc[k] = doc.get(k, 0) + v
        if "$push" in update:
            for k, v in update["$push"].items():
                if k not in doc:
                    doc[k] = []
                doc[k].append(v)
        return MockUpdateResult(modified_count=1, matched_count=1)

    async def update_many(self, query, update):
        cursor = self.find(query)
        modified = 0
        for doc in cursor.data:
            if "$set" in update:
                for k, v in update["$set"].items():
                    doc[k] = v
                    modified += 1
        return MockUpdateResult(modified_count=modified, matched_count=len(cursor.data))

    async def delete_one(self, query):
        doc = await self.find_one(query)
        if doc:
            self.documents.remove(doc)
            return MockDeleteResult(deleted_count=1)
        return MockDeleteResult(deleted_count=0)

    async def delete_many(self, query):
        cursor = self.find(query)
        deleted = len(cursor.data)
        for doc in list(cursor.data):
            self.documents.remove(doc)
        return MockDeleteResult(deleted_count=deleted)

    async def count_documents(self, query):
        cursor = self.find(query)
        return len(cursor.data)

    async def create_index(self, keys, **kwargs):
        return True

class MockDatabase:
    def __init__(self):
        self.collections = {}

    def __getattr__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection(name)
        return self.collections[name]

    def get_collection(self, name):
        return getattr(self, name)

import os

def refactor_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replaces
    replacements = {
        "sqlalchemy.ext.asyncio": "sqlalchemy.orm",
        "AsyncSessionLocal": "SessionLocal",
        "AsyncSession": "Session",
        "create_async_engine": "create_engine",
        "async_sessionmaker": "sessionmaker",
        "async def ": "def ",
        "await db.execute": "db.execute",
        "await db.get": "db.get",
        "await db.commit()": "db.commit()",
        "await db.refresh": "db.refresh",
        "await db.delete": "db.delete",
        "await db.flush()": "db.flush()",
        "await note_service": "note_service",
        "await kanban_service": "kanban_service",
        "await finance_service": "finance_service",
        "await shopping_service": "shopping_service",
        "async with engine.begin()": "with engine.begin()",
        "with AsyncSessionLocal()": "with SessionLocal()",
        "async with ": "with ",
        "yield session": "yield session"
    }

    for old, new in replacements.items():
        content = content.replace(old, new)

    # Specific database.py and main.py fixes
    if "database.py" in filepath:
        content = content.replace("from sqlalchemy.orm import async_sessionmaker", "from sqlalchemy.orm import sessionmaker")
    
    if "main.py" in filepath:
        content = content.replace("await conn.run_sync(Base.metadata.create_all)", "Base.metadata.create_all(conn)")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base_dir = r'D:\Antigravity Pasta\LifeManager\backend\app'
for root, _, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.py'):
            refactor_file(os.path.join(root, file))

# env adjustments
config_path = os.path.join(base_dir, 'config.py')
with open(config_path, 'r', encoding='utf-8') as f:
    cfg = f.read()
cfg = cfg.replace("sqlite+aiosqlite://", "sqlite://")
with open(config_path, 'w', encoding='utf-8') as f:
    f.write(cfg)

env_path = r'D:\Antigravity Pasta\LifeManager\backend\.env'
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        env_c = f.read()
    env_c = env_c.replace("sqlite+aiosqlite://", "sqlite://")
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(env_c)

# Useful Commands
## Run bootstrap DB commands

```bash
docker run --network $NETWORK -v $(pwd)/backend:/netter surrealdb/surrealdb:v2.0.0 import -e $DB_URL --user $DB_USER --pass $DB_PASSWORD --ns $DB_NAMESPACE --db $DB_NAME $FILE
```
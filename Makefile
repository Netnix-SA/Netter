.PHONY: test

# Variables
DB_CONTAINER_NAME=db
TEST_COMMAND=docker compose run backend bun test

test: start-db
	@$(TEST_COMMAND);
	EXIT_CODE=$$?;
	$(MAKE) stop-db;
	@exit $$EXIT_CODE

start-db:
	@docker compose up --remove-orphans -d db
	@sleep 1

stop-db:
	@docker compose down

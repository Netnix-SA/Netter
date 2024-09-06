#!/bin/bash

# Variables
TEST_COMMAND="docker compose run backend bun test $@"

# Function to start the database container
start_db() {
  echo "Starting database container..."
  docker compose up --remove-orphans -d db
  sleep 1
}

# Function to stop the database container
stop_db() {
  echo "Stopping database container..."
  docker compose down
}

# Start the database
start_db

# Run tests
$TEST_COMMAND
TEST_EXIT_CODE=$?

# Stop the database container regardless of test results
stop_db

# Exit with the test command's exit code
exit $TEST_EXIT_CODE

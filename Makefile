up:
	docker compose up --build

down:
	docker compose down -v

bootstrap:
	docker compose run --rm api python -m app.bootstrap --name "Demo Shop" --email owner@example.com --password password
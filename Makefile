NAME = OJ
COMPOSE_FILE_PATH = ./srcs/docker-compose.yml

.PHONY: all
all: $(NAME)

.PHONY: $(NAME)
$(NAME): up

.PHONY: up
up:
	docker compose -f $(COMPOSE_FILE_PATH) up --build

.PHONY: down
down:
	docker compose -f $(COMPOSE_FILE_PATH) down

.PHONY: re
re:
	make down
	make up

.PHONY: clean
clean:

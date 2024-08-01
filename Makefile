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
	make delete_image | make delete_volume

.PHONY: delete_image
delete_image:
	docker rmi -f $$(docker images -aq)

.PHONY: delete_volume
delete_volume:
	docker volume rm $$(docker volume ls -q)
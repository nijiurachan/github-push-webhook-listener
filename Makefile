.PHONY: all format check

all: format check
	@echo See README.md for installation instructions

format:
	bun x biome check --fix

check:
	bun x biome check
	bun x tsc --noEmit

DIR_SRC = src
DIR_SPECS = src
DIR_BIN = bin

FILE_SRC = ${DIR_SRC}/fsa.js
FILE_BIN = ${DIR_BIN}/fsa-${VERSION}.js
FILE_MIN = ${DIR_BIN}/fsa-${VERSION}.min.js

JSCOMPILER = phantomjs

VERSION = $(shell cat version.txt)
DATE=$(shell git log -1 --pretty=format:%ai)


#!/usr/bin/env bash
export RABBIT_SSL_KEY=""
export RABBIT_HOST='localhost'
export RABBIT_PORT='5672'
export RABBIT_REST_PORT='15672'
export RABBIT_USER='guest'
export RABBIT_PASS='guest'
export RABBIT_VHOST='/'
export RABBIT_PROTOCOL='amqp'

npm run dev

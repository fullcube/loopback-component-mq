# loopback-component-mq
Loopback Component for working with a Message Queue

[![Circle CI](https://circleci.com/gh/fullcube/loopback-component-mq.svg?style=svg)](https://circleci.com/gh/fullcube/loopback-component-mq) [![Dependencies](http://img.shields.io/david/fullcube/loopback-component-mq.svg?style=flat)](https://david-dm.org/fullcube/loopback-component-mq) [![Coverage Status](https://coveralls.io/repos/github/fullcube/loopback-component-mq/badge.svg?branch=master)](https://coveralls.io/github/fullcube/loopback-component-mq?branch=master)

## Installation

1. Install in you loopback project:

  `npm install --save loopback-component-mq`

2. Create a `component-config.json` file in your server folder (if you don't already have one)

3. Configure options inside `component-config.json`. *(see configuration section)*

  ```json
  {
    "loopback-component-mq": {
      "options": {
        "dataSource": "rabbit",
        "acls": [{
          "accessType": "*",
          "principalType": "ROLE",
          "principalId": "$unauthenticated",
          "permission": "DENY"
        }]
      },
      "topology": {
        "my-event-queue": {
          "consumer": {
            "model": "Event",
            "method": "consumeEventMessage"
          },
          "producer": {
            "model": "Event",
            "method": "produceEventMessage"
          }
        }
      }
    }
  }
  ```

4. Configure the Rabbit Data Source inside `datasources.json`:

  ```json
  {
    "rabbit": {
      "name": "rabbit",
      "connector": "transient",
      "options": {
        "protocol": "amqp",
        "username": "guest",
        "password": "guest",
        "hostname": "localhost",
        "port": "5672",
        "restPort": "15672",
        "vhost": "/",
        "sslKey": ""
      }
    }
  }
  ```

## Configuration

The configuration of this component happens in `component-config.json`.

The 2 top-level keys are `options` and `topology` which are both objects.

### Options

The `options` object has 2 keys:

- `dataSource` (String, required). This is the name of the RabbitMQ datasource that is configured in `datasources.json`.
Please note that this datasource does not use any `loopback-connector-*` packages, but just a way to tell the component 
how to connect to RabbitMQ.

- `acls` (Array, optional). Use this array to configure the ACL's. This ACL protects the Queue model that gets created.

### Topology

In the `topology` object you configure the queues served by this component. The object key is the name of the Queue. 

Inside this queue definition you can define a `consumer`, a `producer`, or both. The `consumer` and `producer` objects
both accept 2 properties, `model` and `method`.

#### Consumer

When you defined a `consumer` on a queue, the component will call into the `Model.method()` defined when a new message
arrives on the queue. The method will be called with 2 parameters, `payload` and `ack`. Payload is the raw message from
the queue. The `ack` parameter is a message that is used to acknowledge to the queue that the message is being handled.
Make sure to acknowledge all messages, because RabbitMQ won't allow any other messages to be picked up until the message
is acknowledged, making the queue come to a halt.

#### Producer

When defining a `producer` on a queue, the component will create the method `Model.method()` defined. The method created
accepts 1 parameter, `payload`. The payload is the raw message that will be stored on the queue.

## TODO

- Add support for more types of Queues in the topology

## License

MIT

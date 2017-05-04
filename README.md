# loopback-component-mq

[![Greenkeeper badge](https://badges.greenkeeper.io/fullcube/loopback-component-mq.svg)](https://greenkeeper.io/)
Loopback Component for working with a Rabbit Message Queue.

[![Circle CI](https://circleci.com/gh/fullcube/loopback-component-mq.svg?style=svg)](https://circleci.com/gh/fullcube/loopback-component-mq) [![Dependencies](http://img.shields.io/david/fullcube/loopback-component-mq.svg?style=flat)](https://david-dm.org/fullcube/loopback-component-mq) [![Coverage Status](https://coveralls.io/repos/github/fullcube/loopback-component-mq/badge.svg?branch=master)](https://coveralls.io/github/fullcube/loopback-component-mq?branch=master)

# Overview

This component provides a convenient way to work with RabbitMQ within a loopback application. This includes:

 - Defining a RabbitMQ topology using the component-config.json
 - Registering message producers and consumers handlers using a mixin.
 - Inspecting RabbitMQ stats and queue statuses using a RabbitMQ loopback model.

Most of the functionality is enabled through the component configuration where you can define your RabbitMQ topology and configure access to the RabbitmQ stats.

In addition, an optional mixin is provided that provides an easy way to attach message producer and consumer helper methods directly to your loopback models.

# Installation

```
npm install --save loopback-component-mq
```

# Component Config

Create a `component-config.json` file in your server folder (if you don't already have one) and configure options inside `component-config.json`. *(see "Component Configuration"" section)*

```json
"../node_modules/loopback-component-mq/lib": {
  "options": {
    "restPort": 15672,
    "acls": [{
      "accessType": "*",
      "principalType": "ROLE",
      "principalId": "$unauthenticated",
      "permission": "DENY"
    }],
  },
  "topology": {
    "connection": {
      "uri": "amqp://guest:guest@127.0.0.1:5672/",
    },
    "exchanges": [{
      "name": "loopback-component-mq:item.write",
      "type": "topic",
      "persistent": true
    }],
    "queues": [{
      "name": "loopback-component-mq:client.item.write",
      "subscribe": true
    }],
    "bindings": [{
      "exchange": "loopback-component-mq:item.write",
      "target": "loopback-component-mq:client.item.write",
      "keys": ["#"]
    }]
  }
}
```

The 2 top-level keys are `options` and `topology` which are both objects.

## Options

The `options` object has 2 keys:

- `acls` (Array, optional), Define ACLs used to protect the RabbitMQ model that gets created.

- `restPort` (Number, optional, default: 15672), Define the rest port for your Rabbit management interface.

## Topology

In the `topology` object you configure the Rabbit connection, queues, exchanges, and bindings used by this component. Under the hood we use the [Rabbot](https://github.com/arobson/rabbot) package to establish a connection to and configure the topology for Rabbit.

See https://github.com/arobson/rabbot#configuration-via-json for details on how to configure your topology.


# Mixin Config

Add the mixins property to your server/model-config.json:

```json
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "../node_modules/loopback-component-mq/lib/mixins",
      "../common/mixins"
    ]
  }
}
```

To use with your Models add the mixins attribute to the definition object of your model config.

```json
{
  "name": "Widget",
  "properties": {
    "name": {
      "type": "string",
    }
  },
  "mixins": {
    "MessageQueue": {
      "producers": {
        "publishItem": {
          "exchange": "item.write",
          "options": {
            "routingKey": "hi",
            "type": "company.project.messages.textMessage",
            "correlationId": "one",
            "contentType": "application/json",
            "messageId": "100",
            "expiresAfter": "1000 // TTL in ms, in this example 1 second",
            "timestamp": "// posix timestamp (long)",
            "mandatory": "true, //Must be set to true for onReturned to receive unqueued message",
            "headers": {
              "random": "application specific value"
            },
            "timeout": "// ms to wait before cancelling the publish and rejecting the promise"
          }
        }
      },
      "consumers": {
        "consumeItem": {
          "queue": "item.write",
          "type": "created"
        }
      }
    }
  }
}
```

The `MessageQueue` object has 2 keys:

- `producers` (Object, optional). Use this object to define message queue producer helper methods.

- `consumers` (Object, optional). Use this object to define message queue consumer helper methods.

## Producers

You may use the mixin to define producer methods. These are essentially a wrapper around Rabbot's [`publish`](https://github.com/arobson/rabbot#publish-exchangename-options-connectionname-) method and provide a convenient way to publish messages to an exchange.

Producers accept 2 parameters:

 - `exchange` (String, required) Name of the exchange to publish message to.
 - `options` (Object, optional) Default options passed to the Rabbot `publish` method.

Defining a `producer` will result in a static method being added to your Model using the key name as the method name. For example, the above configuration would create the static method `Widget.publishItem`. When called, a producer method will publish a message containing `payload`  on the specified exchange, using the defined publishing options.

The method created accepts 2 parameters:

 - `payload` (Any, required) The raw message that will be sent to the defined exchange.
 - `options` (String|Object, optional) If a string is provided, this will be used as the routing key for the message. You can also provide an options object, which allows you to override any of the default options passed to the Rabbot `publish` method.

## Consumers

You may use the mixin to define consumer methods which provide a convenient way to define a Rabbot message handler using Rabbot's [`handle`](https://github.com/arobson/rabbot#handle-options-handler-) method.

When defining a `consumer` on a queue, the component will register handler to consumer messages from the specified queue.

For example, the above configuration would register the static method `Widget.consumeItem` as a message handle for the `item.write` queue for messages that are using the `created` routing key.

Consumers accept 2 parameters:

 - `queue` (String, required) Name of the queue to consumer messages from.
 - `type` (String, optional) Handle messages with this type name or pattern.

Having defined a consumer in your mixin, you are expected to define the actual consumer method on your model using the key name as the method name. For example, the above configuration would result in the static method `Widget.consumeItem` being registered as a message handler for messages with a type of `created`.

NOTE: you are responsible for creating the `Widget.consumeItem` method - which must accept 1 parameter:

 - `payload` (Any, required) The raw message body pulled from the message queue.

To acknowledge (ack) the message your method should return a resolved Promise.

To reject (nack) the message your method should return a rejected Promise.

# Development

Source files are located in the [`lib`] directory. Edit the source files to make changes while running `npm run dev` in the background.

```bash
  npm run dev
```

Run with debugging output on:

```bash
  DEBUG=loopback:component:mq* npm run dev
```

# TESTING

For error checking and to help maintain style this package uses `eslint` as a pretest.

Run the tests in the `test` directory.

```bash
  npm test
```

Run with debugging output on:

```bash
  DEBUG=loopback:component:mq* npm test
```

# License

MIT

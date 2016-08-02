# loopback-component-mq

## Installation

1. Install in you loopback project:

  `npm install --save loopback-component-mq`

2. Create a component-config.json file in your server folder (if you don't already have one)

3. Configure options inside `component-config.json`. *(see configuration section)*

  ```json
  {
    "loopback-component-mq": {
      "options": {
        "dataSource": "rabbit"
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

4. *Optional:* Configure the Rabbit Data Source inside `datasources.json`. This will override the default connection to
the `rabbitmq` instance running on localhost with guest/guest credentials.

```
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
```

## License

MIT 

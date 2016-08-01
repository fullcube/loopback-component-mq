# loopback-component-mq

## Installation

1. Install in you loopback project:

  `npm install --save loopback-component-mq`

2. Create a component-config.json file in your server folder (if you don't already have one)

3. Configure options inside `component-config.json`. *(see configuration section)*

  ```json
  {
    "loopback-component-mq": {
      "queueName": {
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
  ```

## License

MIT 

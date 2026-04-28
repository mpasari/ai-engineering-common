# KAFKA_TEST_GUIDE.md
# SDLC -- QA Stage -- Kafka Integration Testing Guide
# Version: 1.0.0
# Status: Active
# Last updated: 2026-04
# Owner: CoE Core
#
# This file is read by:
#   - Kafka Skill Agent (A20) -- test event production patterns
#   - Test Gen Agent (A15) -- Kafka test generation
#   - AC Executor Agent (A08) -- event-driven AC execution

---

## 1. Kafka test types

```
Producer test:
  Verify that a business event produces the correct Kafka event
  Assert: event produced to correct topic with correct schema

Consumer test:
  Verify that a consumed event triggers the correct business logic
  Assert: database state change or downstream action after consuming

End-to-end event flow test:
  Producer triggers consumer in same test
  Assert: full flow from trigger to outcome
```

---

## 2. Kafka integration test setup

```java
// Framework: JUnit 5 + Testcontainers Kafka + Spring Kafka Test

@SpringBootTest
@EmbeddedKafka(partitions = 1, topics = {"order.order.cancelled"})
@Tag("integration")
class OrderCancelledEventTest {

    @Autowired KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    @Qualifier("orderCancelledConsumerFactory")
    ConsumerFactory<String, OrderCancelledEvent> consumerFactory;

    @Test
    void cancelOrder_publishesOrderCancelledEvent() throws Exception {
        // Given
        var consumer = createAndSubscribeConsumer();
        var orderId = createPendingOrder().id();

        // When
        cancelOrderViaApi(orderId);

        // Then: event is published within 5 seconds
        var records = KafkaTestUtils.getRecords(consumer, Duration.ofSeconds(5));
        assertThat(records).hasSize(1);

        var event = records.iterator().next().value();
        assertThat(event.orderId()).isEqualTo(orderId);
        assertThat(event.eventType()).isEqualTo("OrderCancelled");
        assertThat(event.occurredAt()).isNotNull();
    }
}
```

---

## 3. Consumer test pattern

```java
@Test
void receiveOrderPlacedEvent_createsOrderInDatabase() throws Exception {
    // Given: produce a test event
    var orderId = UUID.randomUUID();
    var event = new OrderPlacedEvent(orderId, "customer-123", List.of(...));

    // When: send the event to the topic
    kafkaTemplate.send("order.order.placed", orderId.toString(), event).get();

    // Then: verify the consumer processed it within 10 seconds
    await().atMost(10, SECONDS).untilAsserted(() -> {
        var order = orderRepository.findById(orderId);
        assertThat(order).isPresent();
        assertThat(order.get().status()).isEqualTo(OrderStatus.PENDING);
    });
}
```

---

## 4. Schema validation in tests

```java
@Test
void orderCancelledEvent_conformsToRegisteredSchema() {
    // Produce an event and verify it deserialises correctly
    // with the Avro schema from the schema registry
    var event = new OrderCancelledEvent(UUID.randomUUID(), "reason");

    assertThatCode(() -> {
        var serialised = avroSerializer.serialize("order.order.cancelled", event);
        var deserialised = avroDeserialiser.deserialize("order.order.cancelled", serialised);
        assertThat(deserialised).isInstanceOf(OrderCancelledEvent.class);
    }).doesNotThrowAnyException();
}
```

---

## 5. DLQ testing

```java
@Test
void invalidEvent_sendsToDeadLetterQueue() throws Exception {
    // When: produce a malformed event
    kafkaTemplate.send("order.order.placed", "bad-key", "not-a-valid-event");

    // Then: it appears in the DLQ within 5 seconds
    var consumer = createConsumerFor("order.order.placed-dlq");
    var records = KafkaTestUtils.getRecords(consumer, Duration.ofSeconds(5));
    assertThat(records).hasSize(1);
}
```

---

## 6. Kafka test rules

```
Always:
  -- Use Testcontainers or EmbeddedKafka -- never test against real Kafka
  -- Test idempotency: verify duplicate events do not cause double processing
  -- Test DLQ: verify invalid events reach the DLQ
  -- Assert on the consumed event content -- not just that something was produced

Never:
  -- Use production Kafka in tests (Kafka Skill Agent enforces this)
  -- Use real personal data in test events
  -- Leave consumer groups running between tests (isolation required)
```

---

## 7. Version and review

| File owner | CoE Core |
| Review cadence | Quarterly |

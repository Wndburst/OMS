Cómo probar
Crea la base de datos y tablas con el script anterior.

Inicia tu delivery-service (sea con npm start o Docker).

Prueba llamadas HTTP (con Postman o cURL):

POST http://localhost:5003/api/delivery/create con body { "orderID": 1 }
POST http://localhost:5003/api/delivery/assign con body { "deliveryID": 1, "driverRUT": 12345678 }
PUT http://localhost:5003/api/delivery/status con body { "deliveryID": 1, "newStatus": 3 }
(donde 3 = "En Ruta")
GET http://localhost:5003/api/delivery/1 → retorna info de la entrega con ID=1.
GET http://localhost:5003/api/delivery/order/1 → retorna todas las entregas asociadas a la orden ID=1.
GET http://localhost:5003/api/delivery → lista todas las entregas.
Si proteges endpoints, envía el token JWT en el header Authorization: Bearer <token>.

Verifica que, al asignar o cambiar estado, se emitan eventos delivery.status.updated a Kafka.

Revisa logs o usa kafka-console-consumer.sh.

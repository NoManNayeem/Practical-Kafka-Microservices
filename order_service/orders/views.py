from rest_framework import generics
from .models import Order
from .serializers import OrderSerializer
from .producer import OrderProducer

producer = OrderProducer()

class OrderCreateView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def perform_create(self, serializer):
        order = serializer.save()
        order_data = {
            'id': order.id,
            'item': order.item,
            'quantity': order.quantity,
            'status': order.status
        }
        producer.send_order(order_data)

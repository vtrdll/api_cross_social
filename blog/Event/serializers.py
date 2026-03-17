
from rest_framework import serializers
from .models import Event
from datetime import date

class EventSerializer(serializers.ModelSerializer):
	date_initial = serializers.DateField(required=True, input_formats=['%Y-%m-%d'])
	date_end = serializers.DateField(required=True, input_formats=['%Y-%m-%d'])

	class Meta:
		model = Event
		fields = ['text', 'link', 'local', 'title', 'date_initial', 'date_end', 'price']

	def validate_date_initial(self, value):
		if value < date.today():
			raise serializers.ValidationError('DATA INVALIDA')
		return value

	def validate_date_end(self, value):
		if value < date.today():
			raise serializers.ValidationError('DATA INVALIDA')
		return value
	

class EventSerializerList(serializers.ModelSerializer):

    is_participating = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = "__all__"

    def get_is_participating(self, obj):
        user = self.context["request"].user

        if user.is_anonymous:
            return False

        return obj.participants.filter(id=user.id).exists()
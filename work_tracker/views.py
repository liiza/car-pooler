from datetime import datetime

from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.http import Http404
from django.core import serializers

from models import *


def index(request):
    return HttpResponse("Hello, world")

def addTask(request):
    if request.method == 'POST':
        user = User(user_name="foo")
        user.save()
        task = Task.objects.create(content=request.body, start_time=datetime.now(), end_time=datetime.now(), user=user)
        task.save()
        return JsonResponse(serializers.serialize('json', [task]), safe=False)
    else:
        raise Http404("Not Found")

def getTasks(request):
    tasks = Task.objects.all()
    return JsonResponse(serializers.serialize('json', tasks), safe=False)

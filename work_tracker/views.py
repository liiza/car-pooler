from json import loads
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
        task_dir = loads(request.body)
        task = Task.create(task_dir["content"], to_date(task_dir, "startDate"), to_date(task_dir, "endDate"))
        task.save()
        return JsonResponse(serializers.serialize('json', [task]), safe=False)
    else:
        raise Http404("Not Found")

def to_date(d, k):
    return datetime.strptime(d[k], "%Y-%m-%dT%H:%M:%S.%fZ")

def getTasks(request):
    tasks = Task.objects.all()
    return JsonResponse(serializers.serialize('json', tasks), safe=False)

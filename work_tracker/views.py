from django.shortcuts import render
from django.http import HttpResponse
from django.http import Http404

def index(request):
    return HttpResponse("Hello, world")

def addTask(request):
    if request.method == 'POST':
        print request.body
    else:
        raise Http404("Not Found")

from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^task$', views.addTask, name='addTask'),
    url(r'^tasks$', views.getTasks, name='tasks')
]

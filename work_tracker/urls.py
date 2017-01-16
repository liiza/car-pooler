from django.conf.urls import url
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^task$', views.addTask, name='addTask'),
    url(r'^tasks$', views.getTasks, name='tasks'),
    url(r'^login$', TemplateView.as_view(template_name='login.html')),
]

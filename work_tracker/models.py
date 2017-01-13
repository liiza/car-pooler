from __future__ import unicode_literals

from django.db import models

class User(models.Model):
    user_name = models.CharField(max_length=100)

class Task(models.Model):
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    content = models.CharField(max_length=500)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
   
    @classmethod
    def create(cls, content, start, end, user):
        return cls(content=content, start_time=start, end_time=end, user=user)


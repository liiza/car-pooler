from __future__ import unicode_literals

from django.db import models

class Task(models.Model):
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    content = models.CharField(max_length=500)
   
    @classmethod
    def create(cls, content, start, end):
        return cls(content=content, start_time=start, end_time=end)


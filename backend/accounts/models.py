from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.hashers import make_password, check_password


class CustomerManager(BaseUserManager):
    #Primany info for customers is their email and password. eveything else is an extra field 
    def create_user(self, customer_email, password=None, **extra_fields):

        if not customer_email:
            raise ValueError("Email required")

        email = self.normalize_email(customer_email)
        user = self.model(customer_email=email, **extra_fields)
        #hashes password 
        user.set_password(password)  
        user.save(using=self._db)
        return user

'''
Defines customer model. We pass info when registering a user like so:
user = User.objects.create_user(
    customer_email=email,
    password=password,
    customer_first_name=request.data.get("first_name", ""),
    customer_last_name=request.data.get("last_name", ""),
)
'''
class Customer(AbstractBaseUser):
    customer_id = models.AutoField(primary_key=True)
    customer_first_name = models.CharField(max_length=150)
    customer_last_name = models.CharField(max_length=150)
    customer_email = models.EmailField(unique=True)
    customer_password = models.CharField(max_length=128)
    #added new fields to detemine auth flow depdning on user sign up method 
    auth_provider = models.CharField(max_length=20, default="local")
    #allows application to verify google email
    google_subject_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    email_verified = models.BooleanField(default=False)
    location_enabled = models.BooleanField(default=False)

    objects = CustomerManager()

    USERNAME_FIELD = "customer_email"
    REQUIRED_FIELDS = []

    class Meta:
        db_table = "Customer"


class Business(models.Model):
    business_id = models.AutoField(primary_key=True)
    business_email = models.EmailField(unique=True)
    business_password = models.CharField(max_length=128, blank=True, default="")
    business_name = models.CharField(max_length=255)
    business_owner_first_name = models.CharField(max_length=150, blank=True, default="")
    business_owner_last_name = models.CharField(max_length=150, blank=True, default="")
    business_description = models.CharField(max_length=500, blank=True, default="")
    business_address = models.CharField(max_length=255, blank=True, default="")
    google_place_id = models.CharField(max_length=255, blank=True, default="")
    google_place_photos = models.JSONField(default=list, blank=True)
    google_place_reviews = models.JSONField(default=list, blank=True)
    auth_provider = models.CharField(max_length=20, default="local")

    def set_password(self, raw_password):
        self.business_password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.business_password)

    class Meta:
        db_table = "Business"
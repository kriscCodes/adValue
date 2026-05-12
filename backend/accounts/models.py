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
    notifications_enabled = models.BooleanField(default=False)

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


class SavedBusiness(models.Model):
    saved_business_id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="saved_businesses",
    )
    business_external_id = models.IntegerField()
    business_name = models.CharField(max_length=255)
    business_type = models.CharField(max_length=120, blank=True, default="")
    business_img = models.URLField(blank=True, default="")
    business_rating = models.FloatField(default=0)
    business_lat = models.FloatField(default=0)
    business_lng = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "SavedBusiness"
        constraints = [
            models.UniqueConstraint(
                fields=["customer", "business_external_id"],
                name="unique_saved_business_per_customer",
            )
        ]


class Content(models.Model):
    class PlatformChoices(models.TextChoices):
        TIKTOK = "tiktok", "TikTok"
        INSTAGRAM = "instagram", "Instagram"
        YOUTUBE = "youtube", "YouTube"

    class StatusChoices(models.TextChoices):
        PENDING = "pending", "Pending"
        REJECTED = "rejected", "Rejected"
        VALID = "valid", "Valid"

    content_id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="content_submissions",
    )
    # Kept as integer for demo speed; can migrate to FK(Business) later.
    business_id = models.IntegerField()
    platform = models.CharField(max_length=20, choices=PlatformChoices.choices)
    content_url = models.URLField(max_length=500)
    views = models.PositiveIntegerField()
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING,
    )
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "Content"


class ExplorePlace(models.Model):
    """Public explore-map POIs; `external_id` matches app `Business.id` / saved-business keys."""

    explore_place_id = models.AutoField(primary_key=True)
    external_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    rating = models.FloatField(default=0)
    place_type = models.CharField(max_length=120, blank=True, default="")
    img = models.URLField(max_length=500, blank=True, default="")
    address = models.CharField(max_length=300, blank=True, default="")

    class Meta:
        db_table = "ExplorePlace"


class Report(models.Model):
    """Customer-on-business or business-on-customer report.

    Reporter is one of (customer, business); target is the other.
    Reason codes are scoped to who is reporting whom.
    """

    class ReporterType(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        BUSINESS = "business", "Business"

    class TargetType(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        BUSINESS = "business", "Business"

    class ReasonCode(models.TextChoices):
        # Customer-side reasons (customer reports a business)
        VERIFICATION_OVERDUE = "verification_overdue", "Business hasn't verified content in over a week"
        REWARDS_NOT_ISSUED = "rewards_not_issued", "Business hasn't issued rewards after view threshold"
        # Business-side reasons (business reports a customer)
        LOW_QUALITY_CONTENT = "low_quality_content", "Customer submits low quality videos"
        VIEWS_MILESTONE_UNMET = "views_milestone_unmet", "Videos clearly don't meet the milestone"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        REVIEWING = "reviewing", "Reviewing"
        RESOLVED = "resolved", "Resolved"
        DISMISSED = "dismissed", "Dismissed"

    CUSTOMER_REASONS = {ReasonCode.VERIFICATION_OVERDUE, ReasonCode.REWARDS_NOT_ISSUED}
    BUSINESS_REASONS = {ReasonCode.LOW_QUALITY_CONTENT, ReasonCode.VIEWS_MILESTONE_UNMET}

    report_id = models.AutoField(primary_key=True)

    reporter_type = models.CharField(max_length=20, choices=ReporterType.choices)
    reporter_customer = models.ForeignKey(
        Customer,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reports_filed",
    )
    reporter_business = models.ForeignKey(
        Business,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reports_filed",
    )

    target_type = models.CharField(max_length=20, choices=TargetType.choices)
    target_customer = models.ForeignKey(
        Customer,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reports_received",
    )
    target_business = models.ForeignKey(
        Business,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reports_received",
    )

    reason_code = models.CharField(max_length=40, choices=ReasonCode.choices)
    details = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "Report"
        indexes = [
            models.Index(fields=["reporter_type", "reporter_customer"]),
            models.Index(fields=["reporter_type", "reporter_business"]),
            models.Index(fields=["target_type", "target_customer"]),
            models.Index(fields=["target_type", "target_business"]),
        ]
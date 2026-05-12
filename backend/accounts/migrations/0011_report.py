from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0010_exploreplace"),
    ]

    operations = [
        migrations.CreateModel(
            name="Report",
            fields=[
                ("report_id", models.AutoField(primary_key=True, serialize=False)),
                (
                    "reporter_type",
                    models.CharField(
                        choices=[
                            ("customer", "Customer"),
                            ("business", "Business"),
                        ],
                        max_length=20,
                    ),
                ),
                (
                    "target_type",
                    models.CharField(
                        choices=[
                            ("customer", "Customer"),
                            ("business", "Business"),
                        ],
                        max_length=20,
                    ),
                ),
                (
                    "reason_code",
                    models.CharField(
                        choices=[
                            ("verification_overdue", "Business hasn't verified content in over a week"),
                            ("rewards_not_issued", "Business hasn't issued rewards after view threshold"),
                            ("low_quality_content", "Customer submits low quality videos"),
                            ("views_milestone_unmet", "Videos clearly don't meet the milestone"),
                        ],
                        max_length=40,
                    ),
                ),
                ("details", models.TextField(blank=True, default="")),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("open", "Open"),
                            ("reviewing", "Reviewing"),
                            ("resolved", "Resolved"),
                            ("dismissed", "Dismissed"),
                        ],
                        default="open",
                        max_length=20,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "reporter_customer",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="reports_filed",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "reporter_business",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="reports_filed",
                        to="accounts.business",
                    ),
                ),
                (
                    "target_customer",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="reports_received",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "target_business",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="reports_received",
                        to="accounts.business",
                    ),
                ),
            ],
            options={
                "db_table": "Report",
                "indexes": [
                    models.Index(
                        fields=["reporter_type", "reporter_customer"],
                        name="report_reporter_cust_idx",
                    ),
                    models.Index(
                        fields=["reporter_type", "reporter_business"],
                        name="report_reporter_biz_idx",
                    ),
                    models.Index(
                        fields=["target_type", "target_customer"],
                        name="report_target_cust_idx",
                    ),
                    models.Index(
                        fields=["target_type", "target_business"],
                        name="report_target_biz_idx",
                    ),
                ],
            },
        ),
    ]

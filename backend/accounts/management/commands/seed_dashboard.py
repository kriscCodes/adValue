import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from backend.accounts.models import Business, Customer, Content

FAKE_URLS = {
    'tiktok': [
        'https://www.tiktok.com/@creator/video/111111111111',
        'https://www.tiktok.com/@creator/video/222222222222',
        'https://www.tiktok.com/@creator/video/333333333333',
        'https://www.tiktok.com/@creator/video/444444444444',
        'https://www.tiktok.com/@creator/video/555555555555',
    ],
    'instagram': [
        'https://www.instagram.com/reel/AAAAAAAAAA1/',
        'https://www.instagram.com/reel/AAAAAAAAAA2/',
        'https://www.instagram.com/reel/AAAAAAAAAA3/',
        'https://www.instagram.com/reel/AAAAAAAAAA4/',
    ],
    'youtube': [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.com/watch?v=aBcDeFgHiJk',
        'https://www.youtube.com/watch?v=xYzAbCdEfGh',
    ],
}

PLATFORMS = ['tiktok', 'instagram', 'youtube']
STATUSES = ['valid', 'valid', 'valid', 'pending', 'rejected']


class Command(BaseCommand):
    help = 'Seed fake content submissions for all businesses'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing content first')
        parser.add_argument('--count', type=int, default=40, help='Number of submissions to create')

    def handle(self, *args, **options):
        if options['clear']:
            deleted, _ = Content.objects.all().delete()
            self.stdout.write(f'Cleared {deleted} existing content rows.')

        businesses = list(Business.objects.all())
        customers = list(Customer.objects.all())

        if not businesses:
            self.stderr.write('No businesses found.')
            return
        if not customers:
            self.stderr.write('No customers found.')
            return

        count = options['count']
        now = timezone.now()
        created = 0

        for _ in range(count):
            business = random.choice(businesses)
            customer = random.choice(customers)
            platform = random.choice(PLATFORMS)
            views = random.randint(500, 150_000)
            status = random.choice(STATUSES)
            days_ago = random.randint(0, 29)
            submitted_at = now - timedelta(days=days_ago, hours=random.randint(0, 23))
            url = random.choice(FAKE_URLS[platform])

            obj = Content(
                customer=customer,
                business_id=business.business_id,
                platform=platform,
                content_url=url,
                views=views,
                status=status,
            )
            obj.save()
            # Override auto_now_add timestamp
            Content.objects.filter(content_id=obj.content_id).update(submitted_at=submitted_at)
            created += 1

        self.stdout.write(self.style.SUCCESS(
            f'Created {created} fake content submissions across {len(businesses)} businesses.'
        ))

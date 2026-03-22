<script setup lang="ts">
const { t } = useI18n()
const currentYear = new Date().getFullYear()

const footerLinks = [
  {
    title: t('footer.about'),
    links: [
      { name: t('footer.aboutUs'), href: '/about' },
      { name: t('footer.features'), href: '/features' },
      { name: t('footer.pricing'), href: '/pricing' }
    ]
  },
  {
    title: t('footer.support'),
    links: [
      { name: t('footer.help'), href: '/help' },
      { name: t('footer.contact'), href: '/contact' },
      { name: t('footer.faq'), href: '/faq' }
    ]
  },
  {
    title: t('footer.legal'),
    links: [
      { name: t('footer.privacy'), href: '/privacy' },
      { name: t('footer.terms'), href: '/terms' },
      { name: t('footer.cookies'), href: '/cookies' }
    ]
  }
]

const socialLinks = [
  { name: 'Twitter', href: '#', icon: 'lucide:twitter' },
  { name: 'GitHub', href: '#', icon: 'lucide:github' },
  { name: 'LinkedIn', href: '#', icon: 'lucide:linkedin' }
]
</script>

<template>
  <footer class="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
    <UContainer class="py-12">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <!-- Company Info -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/40">
              <Icon name="lucide:shield-check" class="text-primary-700 dark:text-primary-300" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ t('common.appName') }}</h3>
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('footer.description') }}
          </p>
          <div class="flex gap-3">
            <UButton
              v-for="social in socialLinks"
              :key="social.name"
              :to="social?.href"
              variant="ghost"
              color="neutral"
              size="sm"
              class="h-8 w-8 rounded-full p-0"
              :aria-label="social?.name"
            >
              <Icon :name="social?.icon || 'lucide:link'" class="size-4" />
            </UButton>
          </div>
        </div>

        <!-- Footer Links -->
        <div
          v-for="section in footerLinks"
          :key="section.title"
          class="space-y-4"
        >
          <h4 class="text-base font-semibold text-gray-900 dark:text-white">
            {{ section.title }}
          </h4>
          <ul class="space-y-2">
            <li v-for="link in section.links" :key="link.name">
              <UButton
                :to="link?.href"
                variant="link"
                color="neutral"
                class="p-0 h-auto text-left text-sm text-gray-600 dark:text-gray-400"
              >
                {{ link?.name }}
              </UButton>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            © {{ currentYear }} {{ t('common.appName') }}. {{ t('footer.allRightsReserved') }}
          </p>
          <div class="flex gap-6">
            <UButton
              v-for="link in footerLinks[2]?.links"
              :key="link.name"
              :to="link?.href"
              variant="link"
              color="neutral"
              class="p-0 h-auto text-left text-sm text-gray-600 dark:text-gray-400"
            >
              {{ link?.name }}
            </UButton>
          </div>
        </div>
      </div>
    </UContainer>
  </footer>
</template>

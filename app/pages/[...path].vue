<script setup lang="ts">
const { t } = useI18n()

throw createError({
  statusCode: 404,
  statusMessage: t('errorPage.notFoundMessage')
})
</script>

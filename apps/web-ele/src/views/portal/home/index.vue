<script lang="ts" setup>
import AboutUs from './modules/about-us.vue';
import BannerCarousel from './modules/banner-carousel.vue';
import BillingGuide from './modules/billing-guide.vue';
import NewsList from './modules/news-list.vue';
import ProductRecommend from './modules/product-recommend.vue';
import ServiceIntro from './modules/service-intro.vue';
</script>

<template>
  <div>
    <!-- 首页轮播图（GET /portal/banners） -->
    <BannerCarousel />

    <!-- 推荐产品（GET /portal/products/recommend） -->
    <ProductRecommend />

    <!-- 业务服务介绍（GET /portal/services） -->
    <ServiceIntro />

    <!-- 计费说明（GET /portal/billing） -->
    <BillingGuide />

    <!-- 行业资讯（GET /portal/news） -->
    <NewsList />

    <!-- 关于我们（GET /portal/about-us） -->
    <AboutUs />
  </div>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue';

const props = defineProps({
  daily: { type: Array, default: () => [] }
});

const tooltip = ref(null);
const tip = reactive({
  visible: false,
  title: '',
  value: '',
  sub: '',
  left: 0,
  top: 0
});

const geometry = computed(() => {
  const width = 720;
  const height = 264;
  const left = 42;
  const right = 18;
  const top = 28;
  const bottom = 40;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const baseline = height - bottom;
  const maxRaw = Math.max(1, ...props.daily.map((day) => day.recipes));
  const niceMax =
    maxRaw <= 4 ? 4 : maxRaw <= 10 ? Math.ceil(maxRaw / 2) * 2 : Math.ceil(maxRaw / 5) * 5;
  const band = plotW / Math.max(props.daily.length, 1);
  const barW = 22;
  const latestIndex = props.daily.length - 1;
  const total = props.daily.reduce((sum, day) => sum + day.recipes, 0);

  const bars = props.daily.map((day, index) => {
    const x = left + band * index + (band - barW) / 2;
    const value = day.recipes;
    const h = value > 0 ? Math.max(4, (value / niceMax) * plotH) : 0;
    const y = baseline - h;
    const radius = Math.min(4, h);
    const path =
      h > 0
        ? `M${x} ${baseline} L${x} ${y + radius} Q${x} ${y} ${x + radius} ${y} L${
            x + barW - radius
          } ${y} Q${x + barW} ${y} ${x + barW} ${y + radius} L${x + barW} ${baseline} Z`
        : '';
    return {
      index,
      x,
      y,
      h,
      path,
      value,
      label: day.label,
      tipSub: `${day.comments} 条留言 · ${day.users} 位新厨友`,
      hitX: left + band * index,
      latest: index === latestIndex
    };
  });

  const ticks = [0, niceMax / 2, niceMax].map((tick) => ({
    tick,
    y: baseline - (tick / niceMax) * plotH
  }));

  const xLabels = props.daily.map((day, index) => ({
    label: day.label,
    x: left + band * index + band / 2,
    latest: index === latestIndex
  }));

  return {
    width,
    height,
    left,
    right,
    top,
    plotH,
    baseline,
    band,
    barW,
    niceMax,
    total,
    bars,
    ticks,
    xLabels
  };
});

function place(clientX, clientY) {
  const margin = 14;
  const width = tooltip.value?.offsetWidth || 190;
  const height = tooltip.value?.offsetHeight || 72;
  let left = clientX + margin;
  let top = clientY - height - margin;
  if (left + width > window.innerWidth - 10) left = clientX - width - margin;
  if (left < 10) left = 10;
  if (top < 10) top = clientY + margin;
  if (top + height > window.innerHeight - 10) top = window.innerHeight - height - 10;
  tip.left = left;
  tip.top = top;
}

function show(bar, clientX, clientY) {
  tip.title = bar.label;
  tip.value = `${bar.value} 道菜谱`;
  tip.sub = bar.tipSub;
  tip.visible = true;
  nextTick(() => place(clientX, clientY));
}

function onEnter(bar, event) {
  show(bar, event.clientX, event.clientY);
}

function onMove(event) {
  if (tip.visible) place(event.clientX, event.clientY);
}

function onFocus(bar, event) {
  const rect = event.currentTarget.getBoundingClientRect();
  show(bar, rect.left + rect.width / 2, rect.top);
}

function hide() {
  tip.visible = false;
}
</script>

<template>
  <div class="chart-wrap">
    <div
      ref="tooltip"
      class="chart-tooltip"
      :hidden="!tip.visible"
      :style="{ left: `${tip.left}px`, top: `${tip.top}px` }"
    >
      <span class="chart-tooltip__title">{{ tip.title }}</span>
      <strong class="chart-tooltip__value">{{ tip.value }}</strong>
      <span class="chart-tooltip__sub">{{ tip.sub }}</span>
    </div>

    <svg
      class="activity-chart"
      :viewBox="`0 0 ${geometry.width} ${geometry.height}`"
      role="img"
      :aria-label="`近 7 日新增菜谱，共 ${geometry.total} 道`"
    >
      <title>近 7 日新增菜谱</title>
      <g v-for="tick in geometry.ticks" :key="tick.tick">
        <line
          class="chart-gridline"
          :class="{ 'chart-gridline--base': tick.tick === 0 }"
          :x1="geometry.left"
          :x2="geometry.width - geometry.right"
          :y1="tick.y"
          :y2="tick.y"
        />
        <text
          class="chart-axis-label"
          :x="geometry.left - 12"
          :y="tick.y + 4"
          text-anchor="end"
        >
          {{ tick.tick }}
        </text>
      </g>

      <g
        v-for="bar in geometry.bars"
        :key="bar.index"
        class="chart-bar-group"
        tabindex="0"
        :aria-label="`${bar.label}，新增 ${bar.value} 道菜谱，${bar.tipSub}`"
        @mouseenter="onEnter(bar, $event)"
        @mousemove="onMove"
        @mouseleave="hide"
        @focus="onFocus(bar, $event)"
        @blur="hide"
      >
        <rect
          class="chart-hit"
          :x="bar.hitX"
          :y="geometry.top"
          :width="geometry.band"
          :height="geometry.plotH"
          rx="6"
        />
        <path v-if="bar.path" class="chart-bar" :d="bar.path" />
        <text
          v-if="bar.latest && bar.value > 0"
          class="chart-direct-label"
          :x="bar.x + geometry.barW / 2"
          :y="bar.y - 9"
          text-anchor="middle"
        >
          {{ bar.value }}
        </text>
      </g>

      <text
        v-for="label in geometry.xLabels"
        :key="label.label"
        class="chart-x-label"
        :class="{ 'chart-x-label--latest': label.latest }"
        :x="label.x"
        :y="geometry.baseline + 23"
        text-anchor="middle"
      >
        {{ label.label }}
      </text>
    </svg>

    <div class="chart-caption">
      <span>单位：道 / 日</span>
      <span>近 7 日共新增 <strong>{{ geometry.total }}</strong> 道菜谱</span>
    </div>
  </div>

  <details class="chart-table">
    <summary>查看数据表</summary>
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th scope="col">日期</th>
            <th scope="col">新增菜谱</th>
            <th scope="col">新增留言</th>
            <th scope="col">新厨友</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="day in daily" :key="day.date">
            <td>{{ day.label }}</td>
            <td>{{ day.recipes }}</td>
            <td>{{ day.comments }}</td>
            <td>{{ day.users }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </details>
</template>

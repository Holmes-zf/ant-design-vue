<!--
  文本框内嵌开关（「开 / 关」一行式开关，图标形态可变）

  契约：
    props  checked（受控值，v-model:checked）/ disabled / openText / closeText
    emit   update:checked(next) —— 只由用户操作触发，程序改 props 不会回抛

  值通道：checked 是唯一值源，组件零内部状态。
  文案：openText / closeText 由调用方传**已翻译好的文本**（组件不接词条 key），组件内直接显示；
  不传则回落内置「启用 / 禁用」。字段名用「开 / 关」而不是「启用 / 禁用」——
  同一形态后面可能换成眼睛等其它图标（开 = 显示、关 = 隐藏），用开/关才通用；
  open/close 也与项目既有的 openChange 开合语义同源。
  文本由 checked + 文案 computed 派生 ⇒ 切语言 / 父级换文案都实时跟随。
  交互：整框点击与开关本体收敛到同一个 toggle()，开关保留原生 role="switch" 键盘可达
  （Tab 聚焦 + 空格 / 回车）；disabled 时两者都不响应、光标不装可点。
  展示：文本区只读（点击 / 键盘都改不了字），纯展示用。
  属性：未知属性（class / style / id …）落根 div，不会进输入框；要改输入框属性请扩 props。
-->
<template>
  <div class="input-switch-box" :class="{ 'is-disabled': disabled }" @click="toggle">
    <!-- allow-clear 必须显式关：FormInput 内置 `allow-clear` 默认开，
         只读展示一旦出清除键，点掉只会清空 FormInput 自己的镜像值（本件无输入通道）；
         它靠排在 FormInput 的 `v-bind="$attrs"` 之前生效，属对方契约而非本件能力 -->
    <FormInput :value="text" :disabled="disabled" readonly :allow-clear="false">
      <template #suffix>
        <!-- 点开关本体时不冒泡到根容器（否则 change + click 会各翻一次）；键盘空格只发 change -->
        <a-switch :checked="checked" :disabled="disabled" @click.stop @change="toggle" />
      </template>
    </FormInput>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
// FormInput 的槽是动态转发的（`v-for` + `#[slotName]`），Volar 枚举不出槽名
// ⇒ `#suffix` 会被误报 2339（"类型 {} 上不存在属性 suffix"）。取一份 any 引用让模板检查放行；
// 运行时仍是同一个组件（`<script setup>` 的本地绑定优先于全局自动注册）。
import FormInputComponent from '../input/FormInput.vue';

const FormInput: any = FormInputComponent;

interface Props {
  /** 受控开关值（v-model:checked） */
  checked?: boolean;
  /** 禁用：点击无响应、框体置灰 */
  disabled?: boolean;
  /** 开启态文案：调用方传已翻译好的文本（如 '启用'），不传回落内置文案 */
  openText?: string;
  /** 关闭态文案：同上 */
  closeText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  checked: false,
  disabled: false,
  openText: '',
  closeText: '',
});

const emit = defineEmits<{ (e: 'update:checked', next: boolean): void }>();

/** 展示文案：调用方文案优先，未传回落内置文案（纯派生值，不需要额外 watch） */
const text = computed(() => {
  if (props.checked) return props.openText || '启用';
  return props.closeText || '禁用';
});

/** 唯一交互出口：整框点击与开关 change 都走这里 */
const toggle = () => {
  if (props.disabled) return;
  emit('update:checked', !props.checked);
};
</script>

<style lang="less" scoped>
.input-switch-box {
  cursor: pointer;

  &.is-disabled {
    cursor: default;
  }
}
</style>

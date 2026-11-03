import type { App, Plugin } from 'vue';
import RadioGroup from './RadioGroup.vue';
import RadioGroupItem from './RadioGroupItem.vue';

/* istanbul ignore next */
RadioGroup.install = function (app: App) {
  app.component('RadioGroup', RadioGroup);
  app.component('RadioGroupItem', RadioGroupItem);
  return app;
};

export { RadioGroupItem };

export default RadioGroup as typeof RadioGroup & Plugin;

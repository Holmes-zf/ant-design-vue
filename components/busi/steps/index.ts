import type { App, Plugin } from 'vue';
import StepsBox from './StepsBox.vue';
import Step from './internal/Step.vue';
import StepIcon from './internal/StepIcon.vue';
import StepSpotIcon from './internal/StepSpotIcon.vue';

/* istanbul ignore next */
StepsBox.install = function (app: App) {
  app.component('StepsBox', StepsBox);
  app.component('StepItem', Step);
  app.component('StepIcon', StepIcon);
  app.component('StepSpotIcon', StepSpotIcon);
  return app;
};

export { Step, StepIcon, StepSpotIcon };

export default StepsBox as typeof StepsBox & Plugin;

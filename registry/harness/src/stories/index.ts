import type { Story } from "../frame"
import { button, buttonDestructive, iconButton } from "./button"
import { input, textarea } from "./inputs"
import { checkbox, radioGroup, switchStory } from "./toggles"
import { avatar, badge, spinner, tooltip } from "./display"
import { choiceCard, choiceCardDisabled, choiceList, segmentedControl, select, selectPlaceholder, stepper, tabs } from "./choosing"
import { inspector, slider, stepSlider, swatchPicker } from "./controls"
import { questionnaire, questionnaireNps } from "./questionnaire"
import { command, commandSeparator, dialog, dropdownMenu, hoverCard } from "./overlays"
import { pageGrid, panel, panelLayout } from "./layout"
import { buttonGroup, card, cardDisabled, collapsible, inputGroup, scrollArea } from "./containers"

/** Page id (the path) -> story. The id is also the surface id in vois-render.json, so keep it lowercase with dashes. */
export const STORIES: Record<string, Story> = {
  avatar,
  badge,
  button,
  "button-destructive": buttonDestructive,
  "button-group": buttonGroup,
  card,
  "card-disabled": cardDisabled,
  "choice-card": choiceCard,
  "choice-card-disabled": choiceCardDisabled,
  "choice-list": choiceList,
  checkbox,
  collapsible,
  command,
  "command-separator": commandSeparator,
  dialog,
  "dropdown-menu": dropdownMenu,
  "hover-card": hoverCard,
  "icon-button": iconButton,
  input,
  inspector,
  "input-group": inputGroup,
  "page-grid": pageGrid,
  panel,
  "panel-layout": panelLayout,
  questionnaire,
  "questionnaire-nps": questionnaireNps,
  "radio-group": radioGroup,
  "scroll-area": scrollArea,
  "segmented-control": segmentedControl,
  select,
  "select-placeholder": selectPlaceholder,
  slider,
  spinner,
  stepper,
  "step-slider": stepSlider,
  switch: switchStory,
  "swatch-picker": swatchPicker,
  tabs,
  textarea,
  tooltip,
}

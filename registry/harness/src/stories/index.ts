import type { Story } from "../frame"
import { button, buttonDestructive, iconButton } from "./button"
import { input, textarea } from "./inputs"
import { checkbox, radioGroup, switchStory } from "./toggles"
import { avatar, badge, spinner, tooltip } from "./display"
import { choiceCard, choiceCardDisabled, choiceList, segmentedControl, select, selectPlaceholder, stepper, tabs, toggleGroup } from "./choosing"
import { inspector, slider, stepSlider, swatchPicker } from "./controls"
import { questionnaire, questionnaireNps } from "./questionnaire"
import { alertDialog, command, commandSeparator, dialog, dropdownMenu, hoverCard, popover } from "./overlays"
import { calendar, menubar, navigationMenu, pagination } from "./navigation"
import { toast } from "./feedback"
import { pageGrid, panel, panelLayout } from "./layout"
import { accordion, buttonGroup, card, cardDisabled, collapsible, inputGroup, scrollArea } from "./containers"

/** Page id (the path) -> story. The id is also the surface id in vois-render.json, so keep it lowercase with dashes. */
export const STORIES: Record<string, Story> = {
  accordion,
  "alert-dialog": alertDialog,
  avatar,
  badge,
  button,
  "button-destructive": buttonDestructive,
  "button-group": buttonGroup,
  calendar,
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
  menubar,
  "navigation-menu": navigationMenu,
  "page-grid": pageGrid,
  pagination,
  panel,
  "panel-layout": panelLayout,
  popover,
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
  "toggle-group": toggleGroup,
  "step-slider": stepSlider,
  switch: switchStory,
  "swatch-picker": swatchPicker,
  tabs,
  textarea,
  toast,
  tooltip,
}

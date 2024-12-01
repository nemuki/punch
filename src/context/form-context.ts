import { createFormContext } from '@mantine/form'
import { AppSettings, PunchInSettings } from '../types'

export const [
  AppSettingsFormProvider,
  useAppSettingsFormContext,
  useAppSettingsForm,
] = createFormContext<AppSettings>()

export const [
  PunchInSettingFormProvider,
  usePunchInSettingFormContext,
  usePunchInSettingForm,
] = createFormContext<PunchInSettings>()

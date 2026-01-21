/**
 * 컨트롤러 모델 ID와 이름 매핑
 */
export const CONTROLLER_MODELS = {
  dualsense: 'DualSense',
  'dualsense-edge': 'DualSense Edge',
  dualshock4: 'DualShock 4',
  joycon: 'Nintendo Joy-Con',
} as const;

/**
 * 컨트롤러 모델 ID를 이름으로 변환
 */
export function getControllerModelName(modelId: string): string {
  return CONTROLLER_MODELS[modelId as keyof typeof CONTROLLER_MODELS] || modelId;
}

/**
 * 컨트롤러 모델 이름을 ID로 변환
 */
export function getControllerModelId(modelName: string): string {
  const entry = Object.entries(CONTROLLER_MODELS).find(([_, name]) => name === modelName);
  return entry ? entry[0] : modelName;
}

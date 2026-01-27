import { createClient } from '@supabase/supabase-js'
import { nanoid } from 'nanoid'
import { randomUUID } from 'crypto'

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

const customerNames = [
  '김민준', '이서윤', '박도윤', '최서준', '정예은', '강지호', '조수아', '윤시우', '장하은', '임준서',
  '한서연', '오민서', '신지우', '권하윤', '황도현', '송지안', '홍시윤', '백준우', '노서진', '구민재',
  '남다은', '문지훈', '표예린', '손민혁', '배수빈', '유채원', '성재윤', '고은우', '마주원', '변서우',
  '서지후', '태아인', '함지율', '차윤호', '방예준', '염예나', '도하준', '석시현', '천서영', '진우진',
  '하지원', '곽민석', '양서하', '추도원', '탁시온', '팽지환', '제유주', '복연우', '길하율', '여서준'
]

const statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']

async function seedRepairRequests() {
  console.log('Starting to seed repair requests...')

  // Get controller models
  const { data: controllerModels, error: modelsError } = await supabase
    .from('controller_models')
    .select('id')

  if (modelsError || !controllerModels || controllerModels.length === 0) {
    console.error('Failed to get controller models:', modelsError)
    return
  }

  // Get services
  const { data: services, error: servicesError } = await supabase
    .from('controller_services')
    .select('id, base_price')

  if (servicesError || !services || services.length === 0) {
    console.error('Failed to get services:', servicesError)
    return
  }

  const repairRequests = []
  const repairRequestServices = []

  for (let i = 0; i < 50; i++) {
    const customerName = customerNames[i]
    const controllerModel = controllerModels[Math.floor(Math.random() * controllerModels.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    // Random 1-3 services per request
    const numServices = Math.floor(Math.random() * 3) + 1
    const selectedServices = []
    const usedServiceIds = new Set()

    for (let j = 0; j < numServices; j++) {
      let service
      do {
        service = services[Math.floor(Math.random() * services.length)]
      } while (usedServiceIds.has(service.id))

      usedServiceIds.add(service.id)
      selectedServices.push(service)
    }

    const totalAmount = selectedServices.reduce((sum, s) => sum + (s.base_price || 0), 0)

    // Create date in the last 30 days
    const daysAgo = Math.floor(Math.random() * 30)
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - daysAgo)

    const repairId = randomUUID()

    const repairRequest = {
      id: repairId,
      customer_name: customerName,
      customer_phone: '010-9559-7583',
      customer_email: `${customerName.toLowerCase()}@example.com`,
      controller_model: controllerModel.id,
      total_amount: totalAmount,
      status: status,
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
      review_token: status === 'completed' && Math.random() > 0.5 ? nanoid(32) : null,
      review_sent_at: status === 'completed' && Math.random() > 0.5 ? createdAt.toISOString() : null,
    }

    repairRequests.push(repairRequest)

    // Add services for this repair request
    selectedServices.forEach(service => {
      repairRequestServices.push({
        id: randomUUID(),
        repair_request_id: repairId,
        service_id: service.id,
        selected_option_id: null,
        service_price: service.base_price || 0,
        option_price: 0,
        created_at: createdAt.toISOString(),
      })
    })
  }

  // Insert repair requests
  console.log(`Inserting ${repairRequests.length} repair requests...`)
  const { error: repairError } = await supabase
    .from('repair_requests')
    .insert(repairRequests)

  if (repairError) {
    console.error('Failed to insert repair requests:', repairError)
    return
  }

  // Insert repair request services
  console.log(`Inserting ${repairRequestServices.length} repair request services...`)
  const { error: servicesInsertError } = await supabase
    .from('repair_request_services')
    .insert(repairRequestServices)

  if (servicesInsertError) {
    console.error('Failed to insert repair request services:', servicesInsertError)
    return
  }

  console.log('✅ Successfully seeded 50 repair requests!')
}

seedRepairRequests()

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main(){
 const email=process.env.ADMIN_EMAIL || 'admin@voltforce.local';
 const password=process.env.ADMIN_PASSWORD || 'ChangeMe123!';
 await prisma.user.upsert({where:{email}, update:{}, create:{email, name:'Администратор', passwordHash: await bcrypt.hash(password,10)}});
 await prisma.service.createMany({skipDuplicates:true,data:[
  {title:'Монтаж электропроводки',description:'Прокладка кабеля, сборка линий, подключение по проекту.',priceFrom:2500,isPopular:true},
  {title:'Замена щитка',description:'Сборка и замена электрощитов, автоматы, УЗО, маркировка.',priceFrom:8500,isPopular:true},
  {title:'Установка розеток и выключателей',description:'Аккуратный монтаж с проверкой нагрузки и безопасности.',priceFrom:700,isPopular:true},
  {title:'Диагностика неисправностей',description:'Поиск коротких замыканий, перегревов и проблем с нагрузкой.',priceFrom:1500,isPopular:false}
 ]});
 await prisma.review.createMany({data:[{clientName:'Анна',rating:5,text:'Быстро нашли проблему в щитке и всё объяснили простыми словами.'},{clientName:'Сергей',rating:5,text:'Делали электрику в квартире под ключ. Чисто, надёжно, по срокам.'}]});
 await prisma.portfolioItem.createMany({data:[{title:'Электрика в новостройке',objectType:'Квартира',description:'Разводка линий, щит, освещение, розеточные группы.',completedAt:new Date('2025-02-14')},{title:'Замена щита в офисе',objectType:'Офис',description:'Пересборка щита с маркировкой, проверкой нагрузок и тестами.',completedAt:new Date('2025-03-03')}]});
}
main().finally(()=>prisma.$disconnect());

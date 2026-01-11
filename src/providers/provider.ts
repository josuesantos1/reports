import { connectDB, disconnectDB } from "../database/connection"
import { Cadoc3040 } from "../database/schema/cadoc3040"
import * as cadoc3040 from "./cadoc3040/cadoc3040"
import { Doc3040 } from "../types/cadoc3040"

export const Provider3040 = async () => {
  await connectDB()

 // const filter = { period: "01-2026" }

 const total = await Cadoc3040.countDocuments();

  const cursor = Cadoc3040.find()
    .sort({ createdAt: -1 })
    .lean<Doc3040>()
    .cursor()

  console.log(1234)

  let index = 0

  for await (const doc of cursor) {
    index++

    if (total === index) {
      doc.TpArq = "F"
    }

    console.log(total, index, doc.TpArq)
    //console.log(await cadoc3040.Run(doc))
  }

  await disconnectDB()
}

Generate3040()
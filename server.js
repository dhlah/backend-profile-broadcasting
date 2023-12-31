import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import prisma from "./lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get("/member", async (req, res) => {
  const data = await prisma.member.findMany({
    select: { 
      slug: true,
      nama: true,
      kelas: true,
      image: true,
      gender: true,
      jabatan: true,
      divisi: true, 
    }
  });

  if (!data) {
    return res.status(404).json({
        status: 404, 
        message: "Not Found" 
    });
  }
  return res.status(200).json({ 
    status: 200,
    message: "OK",
    data: data 
});
});

app.get('/member/:slug', async (req, res) => {
  const { slug } = req.params

  const memberData = await prisma.member.findUnique({
    where: { slug: slug }
  })
  if (memberData) {
    const memberDivisi = await prisma.divisi.findMany({
      where: { memberId: memberData.slug },
      select: { divisi: true }
    })
    return res.status(200).json({
      status: 200,
    message: "OK",
    data: {
      slug: memberData.slug,
      nama: memberData.nama,
      kelas: memberData.kelas,
      gender: memberData.gender,
      jabatan: memberData.jabatan,
      divisi: memberDivisi
    }
    })
  }

})

app.listen(3001, () => {
    console.log('Server Berjalan Di port 3001')
})

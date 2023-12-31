import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "./lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3001;
const whitelist = ["*"];
app.use((req, res, next) => {
  const origin = req.get("referer");
  const isWhitelisted = whitelist.find((w) => origin && origin.includes(w));
  if (isWhitelisted) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,Content-Type,Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
  }
  // Pass to next layer of middleware
  if (req.method === "OPTIONS") res.sendStatus(200);
  else next();
});

const setContext = (req, res, next) => {
  if (!req.context) req.context = {};
  next();
};
app.use(setContext);

app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    status: 200,
    message: "OK",
  });
});

app.get("/member", async (req, res) => {
  const dataKelas12 = await prisma.member.findMany({
    where: {
      kelas: {
        contains: "12",
      },
      jabatan: 'Anggota',
    },
    select: {
      slug: true,
      nama: true,
      kelas: true,
      image: true,
      gender: true,
      jabatan: true,
      divisi: true,
    },
    orderBy: {
      nama: "asc",
    },
  });

  const dataKelas11 = await prisma.member.findMany({
    where: {
      jabatan: 'Anggota',
      kelas: {
        contains: "11",
      },
    },
    select: {
      slug: true,
      nama: true,
      kelas: true,
      image: true,
      gender: true,
      jabatan: true,
      divisi: true,
    },
    orderBy: {
      nama: "asc",
    },
  });

  const dataKelas10 = await prisma.member.findMany({
    where: {
      jabatan: 'Anggota',
      kelas: {
        contains: "10",
      },
    },
    select: {
      slug: true,
      nama: true,
      kelas: true,
      image: true,
      gender: true,
      jabatan: true,
      divisi: true,
    },
    orderBy: {
      nama: "asc",
    },
  });

  const Kelas12OrangPenting = await prisma.member.findMany({
    where: {
      kelas: {
        contains: "12",
      },
      NOT: {
        jabatan: 'Anggota',
      },
    },
    select: {
      slug: true,
      nama: true,
      kelas: true,
      image: true,
      gender: true,
      jabatan: true,
      divisi: true,
    },
    orderBy: {
      prioritas: "asc",
    },
  });

  const Kelas11OrangPenting = await prisma.member.findMany({
    where: {
      kelas: {
        contains: "11",
      },
      NOT: {
        jabatan: 'Anggota',
      },
    },
    select: {
      slug: true,
      nama: true,
      kelas: true,
      image: true,
      gender: true,
      jabatan: true,
      divisi: true,
    },
    orderBy: {
      prioritas: "asc",
    },
  });

  const data = [...Kelas12OrangPenting, ...dataKelas12, ...Kelas11OrangPenting, ...dataKelas11, ...dataKelas10]

  if (!data) {
    return res.status(404).json({
      status: 404,
      message: "Not Found",
    });
  }
  return res.status(200).json({
    status: 200,
    message: "OK",
    data: data,
  });
});

app.get("/member/:slug", async (req, res) => {
  const { slug } = req.params;

  const memberData = await prisma.member.findUnique({
    where: { slug: slug },
  });
  if (memberData) {
    const memberDivisi = await prisma.divisi.findMany({
      where: { memberId: memberData.slug },
      select: { divisi: true },
    });
    return res.status(200).json({
      status: 200,
      message: "OK",
      data: {
        slug: memberData.slug,
        nama: memberData.nama,
        kelas: memberData.kelas,
        image: memberData.image,
        gender: memberData.gender,
        jabatan: memberData.jabatan,
        divisi: memberDivisi,
      },
    });
  } else {
    return res.status(404).json({
      status: 404,
      message: "Not Found",
    });
  }
});

app.listen(PORT, () => {
  console.log("Server Api Berjalan di Port 3001");
});

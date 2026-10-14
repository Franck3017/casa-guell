import type { LegalContent } from './types'

// Textos legals en català. Han de dir el mateix que es.ts, apartat per apartat (una prova ho comprova).
export const ca: LegalContent = {
  updatedLabel: 'Darrera actualització',
  pendingLabel: 'pendent de completar',
  pendingNotice: 'Falten dades del titular. Fins que hi siguin, aquest document no és complet.',
  noticesTitle: 'Abans de demanar',
  docs: [
    {
      id: 'aviso-legal',
      title: 'Avís legal',
      blocks: [
        {
          heading: 'Qui n\'és el titular',
          paragraphs: [
            'Aquest web és de {holder}, amb NIF {nif} i domicili a {address}. Ens pots escriure a {email} o trucar al {phone}.',
            'Dades registrals: {registry}.'
          ]
        },
        {
          heading: 'Per a què serveix aquest web',
          paragraphs: [
            'Presenta el restaurant Casa Güell, la seva carta i el seu horari, i permet demanar taula. La carta i els preus que valen són els del local el dia de la teva visita: els del web es mantenen al dia, però poden canviar.'
          ]
        },
        {
          heading: 'Reserves',
          paragraphs: [
            'Una reserva demanada al web és una sol·licitud: no està confirmada fins que et truquem o t\'escrivim. Per canviar-la o anul·lar-la, truca\'ns al {phone}.'
          ]
        },
        {
          heading: 'Textos, fotos i marca',
          paragraphs: [
            'Els textos, les fotografies, el disseny i la marca Casa Güell són del seu titular o es fan servir amb permís. No es poden reproduir amb finalitats comercials sense autorització.'
          ]
        },
        {
          heading: 'Enllaços a altres llocs',
          paragraphs: [
            'El web enllaça a Instagram, TikTok i Google Maps. El que hi passi es regeix per les condicions de cadascun.'
          ]
        },
        {
          heading: 'Llei aplicable',
          paragraphs: [
            'Aquest web es regeix per la llei espanyola. Si ets consumidor, qualsevol desacord es resoldrà als jutjats del teu domicili.'
          ]
        }
      ]
    },
    {
      id: 'privacidad',
      title: 'Política de privacitat',
      blocks: [
        {
          heading: 'Qui respon de les teves dades',
          paragraphs: [
            'El responsable és {holder}, amb NIF {nif} i domicili a {address}. Per a qualsevol cosa sobre les teves dades, escriu a {email}.'
          ]
        },
        {
          heading: 'Quines dades tractem i per a què',
          paragraphs: [
            'Quan demanes taula: el teu nom, el teu telèfon, el teu correu si el deixes, el dia, l\'hora, quants veniu i les notes que escriguis. Les fem servir per gestionar la reserva, trucar-te per confirmar-la i, si has deixat correu, enviar-te el justificant, la confirmació i un recordatori el dia abans. Ho fem perquè ens ho demanes en sol·licitar la reserva.',
            'Si a les notes ens indiques una al·lèrgia o una intolerància, és una dada de salut. La fem servir només per atendre\'t en aquella visita i la tractem amb el teu consentiment, que ens dones en escriure-la. Si prefereixes no deixar-la per escrit, digues-nos-ho per telèfon o al local.',
            'Per evitar reserves falses o repetides desem un resum irreversible de l\'adreça IP des de la qual es demana cada reserva. No permet saber qui ets ni recuperar l\'adreça, i s\'esborra quan passa el dia de la reserva. Ho fem pel nostre interès legítim a protegir el sistema de reserves.',
            'Quan t\'apuntes a l\'avís del producte del dia: el teu correu, per enviar-te\'l. Ho fem amb el teu consentiment i et pots donar de baixa quan vulguis.'
          ]
        },
        {
          heading: 'Quant de temps les desem',
          paragraphs: [
            'Les dades d\'una reserva es conserven {retention}. El correu de l\'avís diari, fins que et donis de baixa.'
          ]
        },
        {
          heading: 'Qui més les veu',
          paragraphs: [
            'No venem ni cedim les teves dades. Treballem amb proveïdors que les tracten per encàrrec nostre: Supabase (base de dades de reserves, allotjada a la Unió Europea), Resend (enviament dels correus de la reserva), Formspree (alta a l\'avís diari) i Vercel (allotjament del web).',
            'El mapa de la secció d\'ubicació es carrega des de CARTO, que rep la teva adreça IP en mostrar-lo.',
            'Alguns d\'aquests proveïdors tenen seu als Estats Units. En aquest cas les dades viatgen amb les garanties que exigeix el Reglament General de Protecció de Dades.'
          ]
        },
        {
          heading: 'Els teus drets',
          paragraphs: [
            'Ens pots demanar veure les teves dades, corregir-les, esborrar-les, limitar-ne l\'ús, oposar-t\'hi o endur-te-les, i retirar un consentiment que hagis donat. Escriu-nos a {email} dient què necessites.',
            'Si creus que no hem atès bé la teva petició, pots reclamar davant l\'Agència Espanyola de Protecció de Dades.'
          ],
          links: [{ label: 'Agència Espanyola de Protecció de Dades', href: 'https://www.aepd.es' }]
        }
      ]
    },
    {
      id: 'cookies',
      title: 'Galetes i emmagatzematge',
      blocks: [
        {
          heading: 'Sense publicitat ni seguiment',
          paragraphs: [
            'Aquest web no fa servir galetes de publicitat ni de mesura, i no hi ha cap eina que segueixi el que hi fas. Per això no et demanem que acceptis res en entrar.'
          ]
        },
        {
          heading: 'El que sí que es desa al teu navegador',
          paragraphs: [
            'Només el que tu tries. L\'idioma, si el canvies: una galeta i una dada local anomenades cg-locale, durant un any. I el tema clar o fosc, si el canvies: una dada local anomenada cg-theme. Les pots esborrar des de la configuració del navegador.',
            'El tauler intern del restaurant desa la sessió de qui hi entra. No afecta qui visita el web.'
          ]
        },
        {
          heading: 'El que ve d\'altres llocs',
          paragraphs: [
            'El mapa es carrega des de CARTO, que rep la teva adreça IP en mostrar-lo. Els enllaços a Instagram, TikTok i Google Maps no carreguen res fins que els prems.'
          ]
        }
      ]
    },
    {
      id: 'consumidor',
      title: 'Al·lèrgens i informació al consumidor',
      blocks: [
        {
          heading: 'Al·lèrgens',
          paragraphs: [
            'El Reglament (UE) 1169/2011 obliga a informar de catorze al·lèrgens. La carta assenyala amb una icona els que la cuina ha declarat a cada plat. Les icones són una ajuda i no substitueixen la consulta: les receptes canvien amb el mercat i hi pot haver al·lèrgens sense icona. Pregunta sempre al personal abans de demanar.'
          ]
        },
        {
          heading: 'Preus',
          paragraphs: [
            'Els preus de la carta inclouen l\'IVA. El producte de mercat no té preu fix: pregunta\'l abans de demanar i te\'l direm per peça o per pes.'
          ]
        },
        {
          heading: 'Aigua, sobres i reclamacions',
          paragraphs: [
            'Pots demanar aigua de l\'aixeta sense cost.',
            'El que no t\'acabis t\'ho preparem per emportar.',
            'Al local hi ha fulls oficials de queixa, reclamació i denúncia a la teva disposició.'
          ]
        },
        {
          heading: 'Alcohol',
          paragraphs: ['No servim begudes alcohòliques a menors de 18 anys.']
        },
        {
          heading: 'On informar-te',
          paragraphs: ['Aquests organismes expliquen els teus drets i vigilen que es compleixin.'],
          links: [
            { label: 'Agència Espanyola de Seguretat Alimentària i Nutrició (AESAN)', href: 'https://www.aesan.gob.es' },
            { label: 'Agència Catalana del Consum', href: 'https://consum.gencat.cat' },
            { label: 'Agència de Salut Pública de Catalunya', href: 'https://salutpublica.gencat.cat' }
          ]
        }
      ]
    }
  ]
}

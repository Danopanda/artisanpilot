import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './App.css'

// --- LOGO PAR DÉFAUT (SVG intégré) ---
const defaultLogo = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230ea5e9' rx='20'/><text x='50' y='55' font-family='Arial, sans-serif' font-size='40' font-weight='bold' fill='white' text-anchor='middle'>AP</text></svg>"
);

const traductions = {
  fr: {
    accueil: "Accueil", devis: "Devis", factures: "Factures", clients: "Clients", parametres: "Paramètres",
    monProfil: "Mon Profil", astuces: "Astuces", bonjour: "Bonjour",
    etatActivite: "Voici l'état de votre activité aujourd'hui :",
    suiviActivite: "Suivi de votre activité (en FCFA)",
    derniersDevis: "Derniers Devis", dernieresFactures: "Dernières Factures",
    aucunDevis: "Aucun devis pour le moment.", aucuneFacture: "Aucune facture pour le moment.",
    nouveauDevis: "Nouveau Devis", nouvelleFacture: "Nouvelle Facture",
    actionRapide: "Actions rapides", creerDevis: "+ Créer un devis", creerFacture: "+ Créer une facture",
    nomClient: "Nom du client", designation: "Désignation", qte: "Qté", prix: "Prix Unitaire", total: "Total",
    ajouterLigne: "+ Ajouter une ligne", enregistrerDevis: "Enregistrer le devis", enregistrerFacture: "Enregistrer la facture",
    parametresTitre: "Paramètres", apparence: "Apparence", modeSombre: "Mode sombre",
    langue: "Langue de l'application", profilArtisan: "Mon Profil d'Artisan",
    profilDesc: "Ces informations apparaîtront sur vos PDF.", nomSociete: "Nom de la société",
    telephone: "Téléphone", email: "Email", adresse: "Adresse", logo: "Logo de l'entreprise",
    dangerZone: "Zone de danger", dangerDesc: "Cette action supprimera définitivement tous vos devis et factures.",
    btnSupprimer: "Supprimer l'historique", confirmationSuppr: "Êtes-vous sûr de vouloir supprimer TOUT l'historique ? Cette action est irréversible.",
    enAttente: "En attente", accepte: "Accepté", refuse: "Refusé", payee: "Payée",
    ajouterClient: "Ajouter", gererClients: "Carnet d'adresses", aucunClient: "Aucun client enregistré.", supprimer: "Supprimer",
    note: "Note / Conditions (optionnel)", remise: "Appliquer une remise", montantRemise: "Montant de la remise (FCFA)", sousTotal: "Sous-total",
    partager: "Partager", retour: "Retour à l'accueil",
    bienvenue: "Bienvenue sur ArtisanPilot", onboardDesc: "Avant de commencer, configurez votre profil d'artisan. Ces informations apparaîtront sur vos devis et factures.", commencer: "Commencer à utiliser l'application"
  },
  en: {
    accueil: "Home", devis: "Quotes", factures: "Invoices", clients: "Clients", parametres: "Settings",
    monProfil: "My Profile", astuces: "Tips", bonjour: "Hello",
    etatActivite: "Here is your activity status today:",
    suiviActivite: "Activity Tracking (in FCFA)",
    derniersDevis: "Recent Quotes", dernieresFactures: "Recent Invoices",
    aucunDevis: "No quotes yet.", aucuneFacture: "No invoices yet.",
    nouveauDevis: "New Quote", nouvelleFacture: "New Invoice",
    actionRapide: "Quick Actions", creerDevis: "+ Create Quote", creerFacture: "+ Create Invoice",
    nomClient: "Client name", designation: "Description", qte: "Qty", prix: "Unit Price", total: "Total",
    ajouterLigne: "+ Add a line", enregistrerDevis: "Save Quote", enregistrerFacture: "Save Invoice",
    parametresTitre: "Settings", apparence: "Appearance", modeSombre: "Dark Mode",
    langue: "App Language", profilArtisan: "Artisan Profile",
    profilDesc: "This information will appear on your PDFs.", nomSociete: "Company Name",
    telephone: "Phone", email: "Email", adresse: "Address", logo: "Company Logo",
    dangerZone: "Danger Zone", dangerDesc: "This action will permanently delete all your quotes and invoices.",
    btnSupprimer: "Delete History", confirmationSuppr: "Are you sure you want to delete ALL history? This cannot be undone.",
    enAttente: "Pending", accepte: "Accepted", refuse: "Refused", payee: "Paid",
    ajouterClient: "Add", gererClients: "Address Book", aucunClient: "No clients saved.", supprimer: "Delete",
    note: "Note / Terms (optional)", remise: "Apply discount", montantRemise: "Discount amount (FCFA)", sousTotal: "Subtotal",
    partager: "Share", retour: "Back to home",
    bienvenue: "Welcome to ArtisanPilot", onboardDesc: "Before starting, set up your artisan profile. This information will appear on your quotes and invoices.", commencer: "Start using the app"
  }
}

const IconHome = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>)
const IconDoc = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>)
const IconInvoice = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>)
const IconSettings = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>)
const IconUser = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>)
const IconBulb = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"></path></svg>)
const IconUsers = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>)
const IconShare = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>)

// --- JEU DE DAMES ---
const getValidMoves = (board, color) => {
  const moves = [];
  const isWhite = color === 'blanc';
  const forward = isWhite ? -1 : 1;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.startsWith(color)) {
        const isKing = piece.includes('dame');
        const dirs = isKing ? [[-1,-1], [-1,1], [1,-1], [1,1]] : [[forward,-1], [forward,1]];
        
        for (let [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !board[nr][nc]) {
            moves.push({ from: [r,c], to: [nr,nc], capture: null });
          }
        }

        const captureDirs = [[-1,-1], [-1,1], [1,-1], [1,1]];
        for (let [dr, dc] of captureDirs) {
          const nr = r + dr, nc = c + dc;
          const nnr = r + dr*2, nnc = c + dc*2;
          if (nnr >= 0 && nnr < 8 && nnc >= 0 && nnc < 8) {
            const enemy = board[nr][nc];
            if (enemy && !enemy.startsWith(color) && !board[nnr][nnc]) {
              const isForwardCapture = (dr === forward) || isKing;
              if (isForwardCapture) {
                moves.push({ from: [r,c], to: [nnr,nnc], capture: [nr,nc] });
              }
            }
          }
        }
      }
    }
  }
  const captures = moves.filter(m => m.capture);
  return captures.length > 0 ? captures : moves;
}

const applyMove = (board, move) => {
  const newBoard = board.map(row => [...row]);
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  let piece = newBoard[fr][fc];
  
  newBoard[fr][fc] = null;
  if (move.capture) {
    newBoard[move.capture[0]][move.capture[1]] = null;
  }
  
  if (piece === 'blanc' && tr === 0) piece = 'blanc_dame';
  if (piece === 'noir' && tr === 7) piece = 'noir_dame';
  
  newBoard[tr][tc] = piece;
  return newBoard;
}

const evaluateBoard = (board) => {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        const val = p.includes('dame') ? 10 : 3;
        if (p.startsWith('noir')) score += val;
        if (p.startsWith('blanc')) score -= val;
      }
    }
  }
  return score;
}

const minimax = (board, depth, isMaximizing) => {
  if (depth === 0) return evaluateBoard(board);
  const color = isMaximizing ? 'noir' : 'blanc';
  const moves = getValidMoves(board, color);
  if (moves.length === 0) return isMaximizing ? -1000 : 1000;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let move of moves) {
      const nextBoard = applyMove(board, move);
      const ev = minimax(nextBoard, depth - 1, false);
      maxEval = Math.max(maxEval, ev);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let move of moves) {
      const nextBoard = applyMove(board, move);
      const ev = minimax(nextBoard, depth - 1, true);
      minEval = Math.min(minEval, ev);
    }
    return minEval;
  }
}

const JeuDeDames = ({ onRetour }) => {
  const [board, setBoard] = useState([])
  const [turn, setTurn] = useState('blanc')
  const [selected, setSelected] = useState(null)
  const [winner, setWinner] = useState(null)

  useEffect(() => {
    const initialBoard = Array(8).fill(null).map(() => Array(8).fill(null))
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 !== 0) initialBoard[r][c] = 'noir'
      }
    }
    for (let r = 5; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 !== 0) initialBoard[r][c] = 'blanc'
      }
    }
    setBoard(initialBoard)
  }, [])

  useEffect(() => {
    if (turn === 'noir' && !winner && board.length > 0) {
      setTimeout(() => {
        const moves = getValidMoves(board, 'noir')
        if (moves.length === 0) { setWinner('blanc'); return }
        let bestMove = null
        let bestScore = -Infinity
        for (let move of moves) {
          const nextBoard = applyMove(board, move)
          const score = minimax(nextBoard, 3, false)
          if (score > bestScore) { bestScore = score; bestMove = move }
        }
        setBoard(applyMove(board, bestMove))
        setTurn('blanc')
      }, 500)
    }
  }, [turn, board, winner])

  useEffect(() => {
    if (turn === 'blanc' && !winner && board.length > 0) {
      const moves = getValidMoves(board, 'blanc')
      if (moves.length === 0) setWinner('noir')
    }
  }, [turn, board, winner])

  const handleClick = (r, c) => {
    if (turn !== 'blanc' || winner) return
    const piece = board[r][c]

    if (!piece) {
      if (selected) {
        const moves = getValidMoves(board, 'blanc')
        const validMove = moves.find(m => m.from[0] === selected.r && m.from[1] === selected.c && m.to[0] === r && m.to[1] === c)
        if (validMove) {
          setBoard(applyMove(board, validMove))
          setSelected(null)
          setTurn('noir')
        }
      }
    } else if (piece.startsWith('blanc')) {
      setSelected({ r, c })
    }
  }

  return (
    <div className="dames-container">
      <button className="btn-retour-jeu" onClick={onRetour}>← Retour à l'accueil</button>
      {winner ? (
        <div className="game-over">
          <h2>{winner === 'noir' ? '💀 DANOPANDAS ta Batu ! 💀' : '🎉 Tu as vaincu DANOPANDAS ! 🎉'}</h2>
          <button onClick={() => window.location.reload()} className="btn-rejouer">Rejouer</button>
        </div>
      ) : (
        <>
          <h3 style={{ textAlign: 'center', marginBottom: '10px', marginTop: '10px' }}>
            {turn === 'blanc' ? 'À toi de jouer (Blancs ⚪)' : "L'IA réfléchit... (Noirs ⚫)"}
          </h3>
          <div className="damier">
            {board.map((row, r) => 
              row.map((cell, c) => {
                const isDark = (r + c) % 2 !== 0
                const isSelected = selected && selected.r === r && selected.c === c
                return (
                  <div key={`${r}-${c}`} className={`case ${isDark ? 'case-noire' : 'case-blanche'} ${isSelected ? 'selectionnee' : ''}`} onClick={() => handleClick(r, c)}>
                    {cell && (
                      <div className={`pion ${cell.includes('dame') ? 'dame' : ''} ${cell.includes('blanc') ? 'pion-blanc' : 'pion-noir'}`}>
                        {cell.includes('dame') ? '👑' : ''}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}

function App() {
  const [pageActive, setPageActive] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(false)
  const [langue, setLangue] = useState(() => localStorage.getItem('artisanpilot_langue') || 'fr')
  useEffect(() => { localStorage.setItem('artisanpilot_langue', langue) }, [langue])
  const t = (cle) => traductions[langue][cle] || cle

  useEffect(() => {
    if (darkMode) document.body.classList.add('dark-mode')
    else document.body.classList.remove('dark-mode')
  }, [darkMode])

  const [profil, setProfil] = useState(() => {
    const sauvegarde = localStorage.getItem('artisanpilot_profil')
    return sauvegarde ? JSON.parse(sauvegarde) : { societe: '', telephone: '', email: '', adresse: '', logo: '' }
  })
  
  useEffect(() => { localStorage.setItem('artisanpilot_profil', JSON.stringify(profil)) }, [profil])
  const [isFirstLaunch, setIsFirstLaunch] = useState(!profil.societe)

  const modifierProfil = (e) => { setProfil({ ...profil, [e.target.name]: e.target.value }) }
  const gererLogo = (e) => {
    const fichier = e.target.files[0]
    if (fichier) {
      const lecteur = new FileReader()
      lecteur.onloadend = () => { setProfil({ ...profil, logo: lecteur.result }) }
      lecteur.readAsDataURL(fichier)
    }
  }

  const validerOnboarding = (e) => {
    e.preventDefault()
    if (profil.societe.trim() === '') { alert("Veuillez entrer le nom de votre société."); return }
    localStorage.setItem('artisanpilot_profil', JSON.stringify(profil))
    setIsFirstLaunch(false)
  }

  const [jeuOuvert, setJeuOuvert] = useState(false)

  const calculerSousTotal = (lignes) => lignes.reduce((total, ligne) => total + (Number(ligne.quantite) * Number(ligne.prixUnitaire)), 0)
  const calculerTotalFinal = (lignes, remiseActive, remiseValeur) => {
    const sousTotal = calculerSousTotal(lignes);
    return remiseActive ? sousTotal - Number(remiseValeur || 0) : sousTotal;
  }

  const [clients, setClients] = useState(() => JSON.parse(localStorage.getItem('artisanpilot_clients_v2')) || [])
  const [nomClient, setNomClient] = useState('')
  const [telClient, setTelClient] = useState('')
  const [emailClient, setEmailClient] = useState('')
  useEffect(() => { localStorage.setItem('artisanpilot_clients_v2', JSON.stringify(clients)) }, [clients])

  useEffect(() => {
    if (nomClient.toLowerCase().trim() === 'hamdane' && telClient.trim() === '1234') {
      setJeuOuvert(true)
      setNomClient('')
      setTelClient('')
      setEmailClient('')
    }
  }, [nomClient, telClient])

  const ajouterClient = (e) => {
    e.preventDefault()
    if (nomClient === '') return
    setClients([...clients, { id: Date.now(), nom: nomClient, telephone: telClient, email: emailClient }])
    setNomClient(''); setTelClient(''); setEmailClient('')
  }
  const supprimerClient = (id) => { setClients(clients.filter(c => c.id !== id)) }

  const [devis, setDevis] = useState(() => JSON.parse(localStorage.getItem('artisanpilot_devis_v2')) || [])
  const [clientDevis, setClientDevis] = useState('')
  const [lignesDevis, setLignesDevis] = useState([{ id: Date.now(), designation: "Main d'œuvre", quantite: 1, prixUnitaire: '' }])
  const [statutDevis, setStatutDevis] = useState('En attente')
  const [noteDevis, setNoteDevis] = useState('')
  const [remiseActiveDevis, setRemiseActiveDevis] = useState(false)
  const [remiseDevis, setRemiseDevis] = useState('')

  useEffect(() => { localStorage.setItem('artisanpilot_devis_v2', JSON.stringify(devis)) }, [devis])
  const modifierLigneDevis = (id, champ, valeur) => { setLignesDevis(lignesDevis.map(l => l.id === id ? { ...l, [champ]: valeur } : l)) }
  const ajouterLigneDevis = () => { setLignesDevis([...lignesDevis, { id: Date.now(), designation: '', quantite: 1, prixUnitaire: '' }]) }
  const supprimerLigneDevis = (id) => { setLignesDevis(lignesDevis.filter(l => l.id !== id)) }
  
  const enregistrerDevis = (e) => {
    e.preventDefault()
    if (clientDevis === '') return
    setDevis([...devis, { id: Date.now(), client: clientDevis, lignes: lignesDevis, statut: statutDevis, date: new Date().toLocaleDateString(), note: noteDevis, remiseActive: remiseActiveDevis, remiseValeur: remiseDevis }])
    setClientDevis(''); setLignesDevis([{ id: Date.now(), designation: "Main d'œuvre", quantite: 1, prixUnitaire: '' }]); setStatutDevis('En attente')
    setNoteDevis(''); setRemiseActiveDevis(false); setRemiseDevis('')
  }
  const changerStatutDevis = (id, nouveauStatut) => { setDevis(devis.map(d => d.id === id ? { ...d, statut: nouveauStatut } : d)) }

  const [factures, setFactures] = useState(() => JSON.parse(localStorage.getItem('artisanpilot_factures_v2')) || [])
  const [clientFact, setClientFact] = useState('')
  const [lignesFact, setLignesFact] = useState([{ id: Date.now(), designation: "Main d'œuvre", quantite: 1, prixUnitaire: '' }])
  const [statutFact, setStatutFact] = useState('En attente')
  const [noteFact, setNoteFact] = useState('')
  const [remiseActiveFact, setRemiseActiveFact] = useState(false)
  const [remiseFact, setRemiseFact] = useState('')

  useEffect(() => { localStorage.setItem('artisanpilot_factures_v2', JSON.stringify(factures)) }, [factures])
  const modifierLigneFact = (id, champ, valeur) => { setLignesFact(lignesFact.map(l => l.id === id ? { ...l, [champ]: valeur } : l)) }
  const ajouterLigneFact = () => { setLignesFact([...lignesFact, { id: Date.now(), designation: '', quantite: 1, prixUnitaire: '' }]) }
  const supprimerLigneFact = (id) => { setLignesFact(lignesFact.filter(l => l.id !== id)) }
  
  const enregistrerFacture = (e) => {
    e.preventDefault()
    if (clientFact === '') return
    setFactures([...factures, { id: Date.now(), client: clientFact, lignes: lignesFact, statut: statutFact, date: new Date().toLocaleDateString(), note: noteFact, remiseActive: remiseActiveFact, remiseValeur: remiseFact }])
    setClientFact(''); setLignesFact([{ id: Date.now(), designation: "Main d'œuvre", quantite: 1, prixUnitaire: '' }]); setStatutFact('En attente')
    setNoteFact(''); setRemiseActiveFact(false); setRemiseFact('')
  }
  const changerStatutFacture = (id, nouveauStatut) => { setFactures(factures.map(f => f.id === id ? { ...f, statut: nouveauStatut } : f)) }

  const supprimerHistorique = () => {
    if (window.confirm(t('confirmationSuppr'))) {
      setDevis([]); setFactures([])
      localStorage.removeItem('artisanpilot_devis_v2'); localStorage.removeItem('artisanpilot_factures_v2')
      alert(langue === 'fr' ? "L'historique a été supprimé." : "History has been deleted.")
    }
  }

  const genererPDF = (data, type) => {
    const doc = new jsPDF()
    const titreDocument = type === 'devis' ? t('devis').toUpperCase() : t('factures').toUpperCase()
    
    // Utilise le logo du profil ou le logo par défaut
    const logoToUse = profil.logo || defaultLogo
    
    if (logoToUse) { 
      try { doc.addImage(logoToUse, 'PNG', 14, 10, 30, 30) } catch (e) { console.log("Erreur logo PDF", e) } 
    }

    doc.setFontSize(16); doc.setTextColor(14, 165, 233); doc.text(profil.societe, 14, 50)
    doc.setFontSize(10); doc.setTextColor(100, 100, 100)
    doc.text(profil.adresse, 14, 56); doc.text(`${t('telephone')} : ${profil.telephone}`, 14, 61); doc.text(`${t('email')} : ${profil.email}`, 14, 66)
    doc.setFontSize(18); doc.setTextColor(0, 0, 0); doc.text(titreDocument, 150, 20)
    doc.setFontSize(10); doc.setTextColor(100, 100, 100)
    doc.text(`N° : ${data.id}`, 150, 28); doc.text(`Date : ${data.date}`, 150, 33)
    doc.setFontSize(12); doc.setTextColor(0, 0, 0); doc.text(`${t('nomClient')} : ${data.client}`, 14, 85)
    
    const bodyTableau = data.lignes.map(l => [l.designation, l.quantite, `${l.prixUnitaire} FCFA`, `${l.quantite * l.prixUnitaire} FCFA`])
    
    autoTable(doc, {
      startY: 95, head: [[t('designation'), t('qte'), t('prix'), t('total')]], body: bodyTableau, theme: 'striped',
      headStyles: { fillColor: [14, 165, 233], textColor: 255 }, styles: { font: 'helvetica', fontSize: 10 },
      columnStyles: { 0: { cellWidth: 80 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
    })

    let positionY = doc.lastAutoTable.finalY + 15
    const sousTotal = calculerSousTotal(data.lignes)
    const totalFinal = calculerTotalFinal(data.lignes, data.remiseActive, data.remiseValeur)

    if (data.remiseActive) {
      doc.setFontSize(10); doc.setTextColor(100, 100, 100)
      doc.text(`${t('sousTotal')} : ${sousTotal} FCFA`, 150, positionY)
      doc.setTextColor(239, 68, 68)
      doc.text(`${t('remise')} : -${data.remiseValeur || 0} FCFA`, 150, positionY + 6)
      positionY += 12
    }

    doc.setFontSize(14); doc.setTextColor(0, 0, 0); doc.text(`${t('total')} : ${totalFinal} FCFA`, 150, positionY)

    if (data.note) {
      positionY += 15
      doc.setFontSize(10); doc.setTextColor(100, 100, 100)
      doc.text(`${t('note')} :`, 14, positionY)
      const splitNote = doc.splitTextToSize(data.note, 180)
      doc.text(splitNote, 14, positionY + 6)
      positionY += (splitNote.length * 5)
    }

    let signatureY = positionY + 30;
    if (signatureY > 230) { doc.addPage(); signatureY = 40; }
    doc.setFontSize(11); doc.setTextColor(100, 100, 100)
    doc.text(langue === 'fr' ? "Cachet et Signature de l'Artisan" : "Artisan Stamp & Signature", 25, signatureY)
    doc.text(langue === 'fr' ? "Signature du Client" : "Client Signature", 130, signatureY)
    doc.setDrawColor(200, 200, 200); doc.line(20, signatureY + 25, 90, signatureY + 25); doc.line(120, signatureY + 25, 190, signatureY + 25)
    doc.setFontSize(8); doc.setTextColor(150, 150, 150)
    doc.text("Généré par ArtisanPilot - Merci de votre confiance !", 105, 285, { align: 'center' })
    
    return doc;
  }

  const telechargerPDF = (data, type) => {
    const doc = genererPDF(data, type)
    const titreDocument = type === 'devis' ? t('devis').toUpperCase() : t('factures').toUpperCase()
    doc.save(`${titreDocument}_${data.client.replace(/\s+/g, '_')}.pdf`)
  }

  const partagerDocument = async (data, type) => {
    const doc = genererPDF(data, type)
    const titreDocument = type === 'devis' ? t('devis').toUpperCase() : t('factures').toUpperCase()
    const nomFichier = `${titreDocument}_${data.client.replace(/\s+/g, '_')}.pdf`
    
    const pdfBlob = doc.output('blob')
    const file = new File([pdfBlob], nomFichier, { type: 'application/pdf' })

    const message = langue === 'fr' 
      ? `Bonjour ${data.client}, voici votre ${titreDocument.toLowerCase()} d'un montant de ${calculerTotalFinal(data.lignes, data.remiseActive, data.remiseValeur)} FCFA. Cordialement, ${profil.societe}.`
      : `Hello ${data.client}, here is your ${titreDocument.toLowerCase()} for ${calculerTotalFinal(data.lignes, data.remiseActive, data.remiseValeur)} FCFA. Regards, ${profil.societe}.`

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: nomFichier, text: message })
      } catch (error) { console.log("Partage annulé", error) }
    } else {
      doc.save(nomFichier)
      setTimeout(() => {
        const telClientData = clients.find(c => c.nom === data.client)
        let urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(message + "\n\n(Glissez le fichier PDF téléchargé dans cette discussion)")}`
        if (telClientData && telClientData.telephone) {
          let num = telClientData.telephone.replace(/\s+/g, '')
          if (num.startsWith('0')) num = num.substring(1) 
          urlWhatsApp = `https://wa.me/${num}?text=${encodeURIComponent(message + "\n\n(Glissez le fichier PDF téléchargé dans cette discussion)")}`
        }
        window.open(urlWhatsApp, '_blank')
      }, 1000)
    }
  }

  const stats = [{ titre: t('devis'), valeur: devis.length.toString() }, { titre: t('factures'), valeur: factures.length.toString() }]
  const totalDevis = devis.reduce((acc, d) => acc + calculerTotalFinal(d.lignes, d.remiseActive, d.remiseValeur), 0)
  const totalFactures = factures.reduce((acc, f) => acc + calculerTotalFinal(f.lignes, f.remiseActive, f.remiseValeur), 0)
  const dataGraphique = [{ name: t('devis'), Montant: totalDevis }, { name: t('factures'), Montant: totalFactures }]

  if (isFirstLaunch) {
    return (
      <div className="onboarding-wrapper">
        <div className="onboarding-card">
          <h1>🚀 {t('bienvenue')}</h1>
          <p>{t('onboardDesc')}</p>
          
          <form onSubmit={validerOnboarding} className="onboarding-form">
            <div className="onboarding-group">
              <label>{t('logo')}</label>
              {/* Affiche le logo par défaut si rien n'est chargé */}
              <img src={profil.logo || defaultLogo} alt="Logo" style={{width: '80px', height: '80px', objectFit: 'cover', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc'}} />
              <input type="file" accept="image/*" onChange={gererLogo} />
            </div>
            
            <div className="onboarding-group">
              <label>{t('nomSociete')} *</label>
              <input type="text" name="societe" value={profil.societe} onChange={modifierProfil} placeholder="Ex: 220 SERVICE" required />
            </div>
            
            <div className="onboarding-group">
              <label>{t('telephone')}</label>
              <input type="text" name="telephone" value={profil.telephone} onChange={modifierProfil} placeholder="Ex: +228 90 00 00 00" />
            </div>

            <div className="onboarding-group">
              <label>{t('email')}</label>
              <input type="email" name="email" value={profil.email} onChange={modifierProfil} placeholder="Ex: contact@monentreprise.com" />
            </div>

            <div className="onboarding-group">
              <label>{t('adresse')}</label>
              <input type="text" name="adresse" value={profil.adresse} onChange={modifierProfil} placeholder="Ex: Lomé, Togo" />
            </div>

            <button type="submit" className="btn-onboarding">{t('commencer')} →</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h1>ArtisanPilot</h1>
        <nav>
          <ul>
            <li className={pageActive === 'dashboard' ? 'active' : ''} onClick={() => setPageActive('dashboard')}><IconHome /> {t('accueil')}</li>
            <li className={pageActive === 'clients' ? 'active' : ''} onClick={() => setPageActive('clients')}><IconUsers /> {t('clients')}</li>
            <li className={pageActive === 'devis' ? 'active' : ''} onClick={() => setPageActive('devis')}><IconDoc /> {t('devis')}</li>
            <li className={pageActive === 'factures' ? 'active' : ''} onClick={() => setPageActive('factures')}><IconInvoice /> {t('factures')}</li>
            <li className={pageActive === 'parametres' ? 'active' : ''} onClick={() => setPageActive('parametres')} style={{marginTop: '20px', borderTop: '1px solid #334155', paddingTop: '20px'}}><IconSettings /> {t('parametres')}</li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        
        {pageActive !== 'dashboard' && (
          <button className="btn-back-global" onClick={() => setPageActive('dashboard')}>← {t('retour')}</button>
        )}

        {pageActive === 'dashboard' && (
          <div>
            <h2>{t('accueil')}</h2>
            <div className="stories-bar">
              <div className="story-item" onClick={() => setPageActive('parametres')}>
                <div className="story-ring">
                  {/* UTILISATION DU LOGO PAR DÉFAUT ICI */}
                  <img src={profil.logo || defaultLogo} alt="Profil" />
                </div>
                <span>{t('monProfil')}</span>
              </div>
              <div className="story-item">
                <div className="story-ring story-ring-orange"><div className="story-placeholder"><IconBulb /></div></div>
                <span>{t('astuces')}</span>
              </div>
            </div>

            <div className="chat-bubble-container">
              <div className="chat-bubble">
                <p><strong>{t('bonjour')} {profil.societe} 👋</strong></p>
                <p>{t('etatActivite')}</p>
              </div>
            </div>

            <div className="quick-actions">
              <h3>{t('actionRapide')}</h3>
              <div className="action-buttons">
                <button onClick={() => setPageActive('devis')} className="btn-action btn-action-devis">{t('creerDevis')}</button>
                <button onClick={() => setPageActive('factures')} className="btn-action btn-action-facture">{t('creerFacture')}</button>
              </div>
            </div>

            <div className="dashboard-grid">
              {stats.map((stat, index) => (
                <div className="card" key={index}>
                  <span className="card-title">{stat.titre}</span>
                  <span className="card-value">{stat.valeur}</span>
                </div>
              ))}
            </div>

            <div className="chart-container">
              <h3>{t('suiviActivite')}</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={dataGraphique} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip formatter={(value) => `${value} FCFA`} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                    <Bar dataKey="Montant" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="dashboard-recents">
              <div className="recent-section">
                <h3>{t('derniersDevis')}</h3>
                {devis.length === 0 ? <p className="empty-text">{t('aucunDevis')}</p> : (
                  <div className="liste-documents">
                    {devis.slice().reverse().map(d => (
                      <div className="document-item" key={d.id}>
                        <div className="doc-info"><span className="doc-client">{d.client}</span><span className="doc-date">{d.date}</span></div>
                        <div className="doc-details">
                          <span className="doc-total">{calculerTotalFinal(d.lignes, d.remiseActive, d.remiseValeur)} FCFA</span>
                          <div className="select-wrapper">
                            <select className={"badge select-badge badge-" + d.statut.replace(' ', '').toLowerCase()} value={d.statut} onChange={(e) => changerStatutDevis(d.id, e.target.value)}>
                              <option value="En attente">{t('enAttente')}</option><option value="Accepté">{t('accepte')}</option><option value="Refusé">{t('refuse')}</option>
                            </select>
                          </div>
                        </div>
                        <div className="doc-action">
                          <button onClick={() => telechargerPDF(d, 'devis')} className="btn-pdf">PDF</button>
                          <button onClick={() => partagerDocument(d, 'devis')} className="btn-share"><IconShare /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="recent-section">
                <h3>{t('dernieresFactures')}</h3>
                {factures.length === 0 ? <p className="empty-text">{t('aucuneFacture')}</p> : (
                  <div className="liste-documents">
                    {factures.slice().reverse().map(f => (
                      <div className="document-item" key={f.id}>
                        <div className="doc-info"><span className="doc-client">{f.client}</span><span className="doc-date">{f.date}</span></div>
                        <div className="doc-details">
                          <span className="doc-total">{calculerTotalFinal(f.lignes, f.remiseActive, f.remiseValeur)} FCFA</span>
                          <div className="select-wrapper">
                            <select className={"badge select-badge badge-" + f.statut.replace(' ', '').toLowerCase()} value={f.statut} onChange={(e) => changerStatutFacture(f.id, e.target.value)}>
                              <option value="En attente">{t('enAttente')}</option><option value="Payée">{t('payee')}</option>
                            </select>
                          </div>
                        </div>
                        <div className="doc-action">
                          <button onClick={() => telechargerPDF(f, 'facture')} className="btn-pdf">PDF</button>
                          <button onClick={() => partagerDocument(f, 'facture')} className="btn-share"><IconShare /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {pageActive === 'clients' && (
          <div>
            <h2>{t('gererClients')}</h2>
            <form onSubmit={ajouterClient} className="client-form">
              <input type="text" placeholder={t('nomClient')} value={nomClient} onChange={(e) => setNomClient(e.target.value)} required />
              <input type="text" placeholder={t('telephone')} value={telClient} onChange={(e) => setTelClient(e.target.value)} />
              <input type="email" placeholder={t('email')} value={emailClient} onChange={(e) => setEmailClient(e.target.value)} />
              <button type="submit">{t('ajouterClient')}</button>
            </form>

            {clients.length === 0 ? <p className="empty-text">{t('aucunClient')}</p> : (
              <div className="liste-documents">
                {clients.map(c => (
                  <div className="document-item" key={c.id}>
                    <div className="doc-info"><span className="doc-client">{c.nom}</span><span className="doc-date">{c.telephone || '-'} | {c.email || '-'}</span></div>
                    <button onClick={() => supprimerClient(c.id)} className="btn-danger-small">{t('supprimer')}</button>
                  </div>
                ))}
              </div>
            )}

            {jeuOuvert && (
              <div className="modal-overlay">
                <div className="modal-content jeu-modal" style={{ maxWidth: '500px' }}>
                  <button className="modal-close" onClick={() => setJeuOuvert(false)}>✕</button>
                  <JeuDeDames onRetour={() => { setJeuOuvert(false); setPageActive('dashboard'); }} />
                </div>
              </div>
            )}
          </div>
        )}

        {pageActive === 'devis' && (
          <div>
            <h2>{t('nouveauDevis')}</h2>
            <form onSubmit={enregistrerDevis} className="document-form">
              <div className="form-header">
                <input type="text" placeholder={t('nomClient')} value={clientDevis} onChange={(e) => setClientDevis(e.target.value)} list="liste-clients-devis" required />
                <datalist id="liste-clients-devis">{clients.map(c => <option key={c.id} value={c.nom} />)}</datalist>
                <select value={statutDevis} onChange={(e) => setStatutDevis(e.target.value)}>
                  <option value="En attente">{t('enAttente')}</option><option value="Accepté">{t('accepte')}</option><option value="Refusé">{t('refuse')}</option>
                </select>
              </div>
              
              <div className="lignes-container">
                <div className="ligne-header"><span>{t('designation')}</span><span>{t('qte')}</span><span>{t('prix')}</span><span>{t('total')}</span><span></span></div>
                {lignesDevis.map((ligne) => (
                  <div key={ligne.id} className="ligne-item">
                    <input type="text" placeholder="Ex: Câble..." value={ligne.designation} onChange={(e) => modifierLigneDevis(ligne.id, 'designation', e.target.value)} required />
                    <input type="number" min="1" value={ligne.quantite} onChange={(e) => modifierLigneDevis(ligne.id, 'quantite', e.target.value)} required />
                    <input type="number" min="0" placeholder="0" value={ligne.prixUnitaire} onChange={(e) => modifierLigneDevis(ligne.id, 'prixUnitaire', e.target.value)} required />
                    <span className="ligne-total">{ligne.quantite * ligne.prixUnitaire} FCFA</span>
                    <button type="button" onClick={() => supprimerLigneDevis(ligne.id)} className="btn-suppr">✕</button>
                  </div>
                ))}
              </div>

              <div className="form-options">
                <textarea placeholder={t('note')} value={noteDevis} onChange={(e) => setNoteDevis(e.target.value)} rows="2"></textarea>
                <div className="remise-section">
                  <label className="remise-label">
                    <span>{t('remise')}</span>
                    <label className="switch">
                      <input type="checkbox" checked={remiseActiveDevis} onChange={() => setRemiseActiveDevis(!remiseActiveDevis)} />
                      <span className="slider round"></span>
                    </label>
                  </label>
                  {remiseActiveDevis && (
                    <input type="number" min="0" placeholder={t('montantRemise')} value={remiseDevis} onChange={(e) => setRemiseDevis(e.target.value)} />
                  )}
                </div>
              </div>

              <button type="button" onClick={ajouterLigneDevis} className="btn-ajout-ligne">{t('ajouterLigne')}</button>
              <div className="form-footer">
                <div>
                   {remiseActiveDevis && <div style={{fontSize:'12px', color:'var(--text-muted)', marginBottom:'5px'}}>{t('sousTotal')} : {calculerSousTotal(lignesDevis)} FCFA</div>}
                   <h3>{t('total')} : {calculerTotalFinal(lignesDevis, remiseActiveDevis, remiseDevis)} FCFA</h3>
                </div>
                <button type="submit" className="btn-primary">{t('enregistrerDevis')}</button>
              </div>
            </form>
          </div>
        )}

        {pageActive === 'factures' && (
          <div>
            <h2>{t('nouvelleFacture')}</h2>
            <form onSubmit={enregistrerFacture} className="document-form">
              <div className="form-header">
                <input type="text" placeholder={t('nomClient')} value={clientFact} onChange={(e) => setClientFact(e.target.value)} list="liste-clients-fact" required />
                <datalist id="liste-clients-fact">{clients.map(c => <option key={c.id} value={c.nom} />)}</datalist>
                <select value={statutFact} onChange={(e) => setStatutFact(e.target.value)}>
                  <option value="En attente">{t('enAttente')}</option><option value="Payée">{t('payee')}</option>
                </select>
              </div>
              
              <div className="lignes-container">
                <div className="ligne-header"><span>{t('designation')}</span><span>{t('qte')}</span><span>{t('prix')}</span><span>{t('total')}</span><span></span></div>
                {lignesFact.map((ligne) => (
                  <div key={ligne.id} className="ligne-item">
                    <input type="text" placeholder="Ex: Matériel..." value={ligne.designation} onChange={(e) => modifierLigneFact(ligne.id, 'designation', e.target.value)} required />
                    <input type="number" min="1" value={ligne.quantite} onChange={(e) => modifierLigneFact(ligne.id, 'quantite', e.target.value)} required />
                    <input type="number" min="0" placeholder="0" value={ligne.prixUnitaire} onChange={(e) => modifierLigneFact(ligne.id, 'prixUnitaire', e.target.value)} required />
                    <span className="ligne-total">{ligne.quantite * ligne.prixUnitaire} FCFA</span>
                    <button type="button" onClick={() => supprimerLigneFact(ligne.id)} className="btn-suppr">✕</button>
                  </div>
                ))}
              </div>

              <div className="form-options">
                <textarea placeholder={t('note')} value={noteFact} onChange={(e) => setNoteFact(e.target.value)} rows="2"></textarea>
                <div className="remise-section">
                  <label className="remise-label">
                    <span>{t('remise')}</span>
                    <label className="switch">
                      <input type="checkbox" checked={remiseActiveFact} onChange={() => setRemiseActiveFact(!remiseActiveFact)} />
                      <span className="slider round"></span>
                    </label>
                  </label>
                  {remiseActiveFact && (
                    <input type="number" min="0" placeholder={t('montantRemise')} value={remiseFact} onChange={(e) => setRemiseFact(e.target.value)} />
                  )}
                </div>
              </div>

              <button type="button" onClick={ajouterLigneFact} className="btn-ajout-ligne">{t('ajouterLigne')}</button>
              <div className="form-footer">
                <div>
                   {remiseActiveFact && <div style={{fontSize:'12px', color:'var(--text-muted)', marginBottom:'5px'}}>{t('sousTotal')} : {calculerSousTotal(lignesFact)} FCFA</div>}
                   <h3>{t('total')} : {calculerTotalFinal(lignesFact, remiseActiveFact, remiseFact)} FCFA</h3>
                </div>
                <button type="submit" className="btn-primary">{t('enregistrerFacture')}</button>
              </div>
            </form>
          </div>
        )}

        {pageActive === 'parametres' && (
          <div>
            <h2>{t('parametresTitre')}</h2>
            <div className="parametres-section">
              <h3>{t('apparence')} & {t('langue')}</h3>
              <div className="parametre-item">
                <span>{t('modeSombre')}</span>
                <label className="switch"><input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} /><span className="slider round"></span></label>
              </div>
              <div className="parametre-item" style={{marginTop: '15px'}}>
                <span>{t('langue')}</span>
                <select value={langue} onChange={(e) => setLangue(e.target.value)} className="select-langue">
                  <option value="fr">Français</option><option value="en">English</option>
                </select>
              </div>
            </div>
            <div className="parametres-section">
              <h3>{t('profilArtisan')}</h3>
              <p style={{marginBottom: '20px', color: 'var(--text-muted)', fontSize: '14px'}}>{t('profilDesc')}</p>
              <div className="profil-container">
                <div className="profil-form">
                  <label>{t('nomSociete')}</label><input type="text" name="societe" value={profil.societe} onChange={modifierProfil} />
                  <label>{t('telephone')}</label><input type="text" name="telephone" value={profil.telephone} onChange={modifierProfil} />
                  <label>{t('email')}</label><input type="email" name="email" value={profil.email} onChange={modifierProfil} />
                  <label>{t('adresse')}</label><input type="text" name="adresse" value={profil.adresse} onChange={modifierProfil} />
                </div>
                <div className="profil-logo">
                  <label>{t('logo')}</label>
                  {/* LOGO PAR DÉFAUT ICI AUSSI */}
                  <img src={profil.logo || defaultLogo} alt="Logo" style={{width: '100px', height: '100px', objectFit: 'cover', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc'}} />
                  <input type="file" accept="image/*" onChange={gererLogo} />
                </div>
              </div>
            </div>
            <div className="parametres-section danger-zone">
              <h3>{t('dangerZone')}</h3>
              <p style={{marginBottom: '15px', color: 'var(--text-muted)', fontSize: '14px'}}>{t('dangerDesc')}</p>
              <button onClick={supprimerHistorique} className="btn-danger">{t('btnSupprimer')}</button>
            </div>
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <div className={`nav-item ${pageActive === 'dashboard' ? 'active' : ''}`} onClick={() => setPageActive('dashboard')}><IconHome /><small>{t('accueil')}</small></div>
        <div className={`nav-item ${pageActive === 'clients' ? 'active' : ''}`} onClick={() => setPageActive('clients')}><IconUsers /><small>{t('clients')}</small></div>
        <div className={`nav-item ${pageActive === 'devis' ? 'active' : ''}`} onClick={() => setPageActive('devis')}><IconDoc /><small>{t('devis')}</small></div>
        <div className={`nav-item ${pageActive === 'factures' ? 'active' : ''}`} onClick={() => setPageActive('factures')}><IconInvoice /><small>{t('factures')}</small></div>
        <div className={`nav-item ${pageActive === 'parametres' ? 'active' : ''}`} onClick={() => setPageActive('parametres')}><IconSettings /><small>{t('parametres')}</small></div>
      </nav>
    </div>
  )
}

export default App
//+------------------------------------------------------------------+
//|                                            MultiLogicEA.mq5      |
//|   Portierung von "Buy-Sell Signals using Multi-Logic Trend,      |
//|   Momentum & Breakout System" (© InvestyourAsset) nach MQL5      |
//|   Vollautomatischer Expert Advisor                               |
//+------------------------------------------------------------------+
#property copyright "MultiLogic EA - Portierung des Pine Script Indikators"
#property link      ""
#property version   "1.00"
#property description "Multi-Logic: Trend / Momentum / Breakout / Mean-Reversion mit Confluence-Score, VWAP, OBV und HTF-Filter."

#include <Trade\Trade.mqh>

//+------------------------------------------------------------------+
//| 1. MARKTSTRUKTUR & TREND                                          |
//+------------------------------------------------------------------+
input group "=== 1. Marktstruktur & Trend ==="
input int    FastEmaLength      = 20;    // Schnelle EMA
input int    MidEmaLength       = 50;    // Mittlere EMA
input int    SlowEmaLength      = 200;   // Langsame EMA
input int    RangeLength        = 30;    // Range Lookback
input double RangeThresholdPct  = 5.0;   // Max. Range-Breite %

//+------------------------------------------------------------------+
//| 2. HIGHER-TIMEFRAME FILTER                                        |
//+------------------------------------------------------------------+
input group "=== 2. Higher-Timeframe Filter ==="
input bool            UseHtfFilter  = true;         // HTF Trendfilter verwenden
input ENUM_TIMEFRAMES HtfTimeframe  = PERIOD_H1;    // Höherer Timeframe
input int             HtfEmaLength  = 50;           // HTF EMA Länge

//+------------------------------------------------------------------+
//| 3. VWAP FILTER                                                    |
//+------------------------------------------------------------------+
input group "=== 3. VWAP Filter ==="
input bool   UseVwapFilter      = true;  // Session-VWAP Filter verwenden

//+------------------------------------------------------------------+
//| 4. ENTRY LOGIK                                                    |
//+------------------------------------------------------------------+
input group "=== 4. Entry Logik ==="
input int    RsiLength                 = 14;    // RSI Länge
input int    MacdFastLength            = 12;    // MACD Fast
input int    MacdSlowLength            = 26;    // MACD Slow
input int    MacdSignalLength          = 9;     // MACD Signal
input int    BbLength                  = 20;    // Bollinger Länge
input double BbDeviation               = 2.0;   // Bollinger Abweichung
input int    MinimumConfluence         = 4;     // Min. Trend-Confluence (2-6)
input bool   EnableTrendLogic          = true;  // Trend-Following Logik
input bool   EnableMomentumLogic       = true;  // Momentum Logik
input bool   EnableBreakoutLogic       = true;  // Range-Breakout Logik
input double BreakoutAtrBuffer         = 0.15;  // Breakout Puffer (x ATR)
input double BreakoutMinClosePosition  = 0.60;  // Breakout Min. Close-Position in Kerze
input bool   RequireVolumeForBreakout  = true;  // Hohes Volumen für Breakout nötig
input bool   EnableMeanReversion       = false; // Seitwärts Mean-Reversion Logik
input double MinRangeAtrRatio          = 1.0;   // Mean-Reversion Min. Range (x ATR)
input double ReversionWickRatio        = 0.35;  // Mean-Reversion Min. Rejection-Docht
input bool   RequireRsiTurnForReversion= true;  // Mean-Reversion RSI muss drehen

//+------------------------------------------------------------------+
//| 5. VOLUMEN-BESTÄTIGUNG                                            |
//+------------------------------------------------------------------+
input group "=== 5. Volumen-Bestätigung ==="
input bool   UseVolumeFilter    = true;  // Volumenfilter verwenden
input int    VolumeMaLength     = 20;    // Volumen MA Länge
input double VolumeMultiplier   = 1.5;   // Hoch-Volumen Multiplikator
input int    ObvMaLength        = 14;    // OBV MA Länge

//+------------------------------------------------------------------+
//| 6. STOP-LOSS & TARGET                                             |
//+------------------------------------------------------------------+
enum ENUM_STOP_METHOD
{
   STOP_STRUCTURE_ATR = 0,   // Struktur + ATR
   STOP_ATR           = 1,   // ATR
   STOP_FIXED_PCT     = 2    // Fester Prozentsatz
};

enum ENUM_TARGET_METHOD
{
   TARGET_RR        = 0,     // Risk:Reward
   TARGET_ATR       = 1,     // ATR
   TARGET_FIXED_PCT = 2      // Fester Prozentsatz
};

input group "=== 6. Stop-Loss & Target ==="
input int                AtrLength           = 14;                  // ATR Länge
input ENUM_STOP_METHOD   StopMethod          = STOP_STRUCTURE_ATR;  // Stop-Loss Methode
input ENUM_TARGET_METHOD TargetMethod        = TARGET_RR;           // Target Methode
input int                SwingLookback       = 10;                  // Struktur Swing Lookback
input double             StructureAtrBuffer  = 0.20;                // Struktur ATR Puffer
input double             StopAtrMultiplier   = 1.5;                 // Stop ATR Multiplikator
input double             TargetAtrMultiplier = 2.5;                 // Target ATR Multiplikator
input double             FixedStopPct        = 2.5;                 // Fester Stop %
input double             FixedTargetPct      = 5.0;                 // Festes Target %
input double             RiskRewardRatio     = 1.5;                 // Risk:Reward Verhältnis

//+------------------------------------------------------------------+
//| 7. SIGNAL-STEUERUNG                                               |
//+------------------------------------------------------------------+
input group "=== 7. Signal-Steuerung ==="
input int    CooldownBars               = 5;     // Min. Bars zwischen Signalen
input bool   FreshSetupOnly             = true;  // Nur bei neu entstandenem Setup
input bool   RequireExitBeforeNextSignal= true;  // Auf SL/TP warten vor nächstem Signal
input bool   AllowOppositeSignal        = true;  // Gegensignal erlauben (wenn Warten AUS)

//+------------------------------------------------------------------+
//| 8. RISIKO & POSITIONSGRÖSSE                                       |
//+------------------------------------------------------------------+
input group "=== 8. Risiko & Positionsgröße ==="
input double RiskPercent        = 0.5;    // Risiko pro Trade in %
input bool   RiskOnFixedBal     = true;   // Risiko auf feste Referenz-Balance
input double FixedBalanceRef    = 50000;  // Referenz-Balance
input double MaxLotsPerTrade    = 1.0;    // Max. Lot pro Trade

//+------------------------------------------------------------------+
//| 9. HANDELSZEITEN & SCHUTZ                                         |
//+------------------------------------------------------------------+
input group "=== 9. Handelszeiten & Schutz ==="
input bool   UseSessionFilter    = false; // Handelszeit-Filter verwenden
input int    SessionStartHour    = 7;     // Handel ab (UTC)
input int    SessionEndHour      = 20;    // Handel bis (UTC)
input bool   TradeMonday         = true;
input bool   TradeTuesday        = true;
input bool   TradeWednesday      = true;
input bool   TradeThursday       = true;
input bool   TradeFriday         = true;
input int    FridayCloseHour     = 20;    // Freitag alles schließen (UTC)
input bool   EnableEquityGuard   = false; // Equity-Schutz aktivieren
input double MaxDailyLossPercent = 4.0;   // Max. Tagesverlust %
input double MaxTotalDrawdown    = 8.0;   // Max. Gesamt-Drawdown %

//+------------------------------------------------------------------+
//| 10. SONSTIGES                                                     |
//+------------------------------------------------------------------+
input group "=== 10. Sonstiges ==="
input int    MagicNumber        = 40001;
input string EAComment          = "MultiLogicEA";
input bool   EnableTradeLog     = true;
input bool   EnableAlerts       = false;

//+------------------------------------------------------------------+
//| GLOBALE VARIABLEN                                                 |
//+------------------------------------------------------------------+
CTrade Trade;

int h_EmaFast  = INVALID_HANDLE;
int h_EmaMid   = INVALID_HANDLE;
int h_EmaSlow  = INVALID_HANDLE;
int h_HtfEma   = INVALID_HANDLE;
int h_Rsi      = INVALID_HANDLE;
int h_Macd     = INVALID_HANDLE;
int h_Bands    = INVALID_HANDLE;
int h_Atr      = INVALID_HANDLE;
int h_Obv      = INVALID_HANDLE;
int h_ObvMa    = INVALID_HANDLE;

datetime g_LastBarTime   = 0;
datetime g_LastSignalBar = 0;   // Zeitstempel des letzten Signals
bool     g_AwaitingExit  = false;
int      g_TradeDirection= 0;   // 1 = long, -1 = short, 0 = flat

double   g_DayStartEquity = 0;
double   g_PeakEquity     = 0;
bool     g_DailyStop      = false;
bool     g_TotalDDStop    = false;
datetime g_LastDayCheck   = 0;

//--- Auswertungs-Kontext für einen bestimmten Bar-Shift
struct SignalContext
{
   bool   valid;
   double open, high, low, close;
   double prevClose;
   double emaFast, emaMid, emaSlow;
   double rsi, rsiPrev;
   double macdMain, macdSignal, macdHist, macdHistPrev;
   double bbBasis;
   double atr;
   double htfEma;
   double vwap;
   double obv, obvAvg;
   double volume, volumeAvg;
   double priorRangeHigh, priorRangeLow;
   double prevRangeHigh, prevRangeLow;   // Range-Grenzen eine Kerze früher
   double priorSwingHigh, priorSwingLow;
};

//+------------------------------------------------------------------+
//| OnInit                                                            |
//+------------------------------------------------------------------+
int OnInit()
{
   Trade.SetExpertMagicNumber(MagicNumber);
   Trade.SetDeviationInPoints(20);

   int sf = (int)SymbolInfoInteger(_Symbol, SYMBOL_FILLING_MODE);
   ENUM_ORDER_TYPE_FILLING fill = ORDER_FILLING_RETURN;
   if((sf & SYMBOL_FILLING_FOK) != 0)      fill = ORDER_FILLING_FOK;
   else if((sf & SYMBOL_FILLING_IOC) != 0) fill = ORDER_FILLING_IOC;
   Trade.SetTypeFilling(fill);

   h_EmaFast = iMA(_Symbol, PERIOD_CURRENT, FastEmaLength, 0, MODE_EMA, PRICE_CLOSE);
   h_EmaMid  = iMA(_Symbol, PERIOD_CURRENT, MidEmaLength,  0, MODE_EMA, PRICE_CLOSE);
   h_EmaSlow = iMA(_Symbol, PERIOD_CURRENT, SlowEmaLength, 0, MODE_EMA, PRICE_CLOSE);
   h_Rsi     = iRSI(_Symbol, PERIOD_CURRENT, RsiLength, PRICE_CLOSE);
   h_Macd    = iMACD(_Symbol, PERIOD_CURRENT, MacdFastLength, MacdSlowLength, MacdSignalLength, PRICE_CLOSE);
   h_Bands   = iBands(_Symbol, PERIOD_CURRENT, BbLength, 0, BbDeviation, PRICE_CLOSE);
   h_Atr     = iATR(_Symbol, PERIOD_CURRENT, AtrLength);
   h_Obv     = iOBV(_Symbol, PERIOD_CURRENT, VOLUME_TICK);

   if(h_EmaFast == INVALID_HANDLE || h_EmaMid == INVALID_HANDLE || h_EmaSlow == INVALID_HANDLE ||
      h_Rsi == INVALID_HANDLE || h_Macd == INVALID_HANDLE || h_Bands == INVALID_HANDLE ||
      h_Atr == INVALID_HANDLE || h_Obv == INVALID_HANDLE)
   {
      Print("FEHLER: Indikator-Handle konnte nicht erstellt werden.");
      return INIT_FAILED;
   }

   // Gleitender Durchschnitt auf den OBV-Puffer
   h_ObvMa = iMA(_Symbol, PERIOD_CURRENT, ObvMaLength, 0, MODE_SMA, h_Obv);
   if(h_ObvMa == INVALID_HANDLE)
   {
      Print("FEHLER: OBV-MA Handle konnte nicht erstellt werden.");
      return INIT_FAILED;
   }

   if(UseHtfFilter)
   {
      h_HtfEma = iMA(_Symbol, HtfTimeframe, HtfEmaLength, 0, MODE_EMA, PRICE_CLOSE);
      if(h_HtfEma == INVALID_HANDLE)
      {
         Print("FEHLER: HTF EMA Handle konnte nicht erstellt werden.");
         return INIT_FAILED;
      }
   }

   double eq = AccountInfoDouble(ACCOUNT_EQUITY);
   g_DayStartEquity = eq;
   g_PeakEquity     = eq;
   g_LastDayCheck   = TimeCurrent();

   if(EnableEquityGuard)
   {
      string pk = "ML_Peak_" + IntegerToString(MagicNumber);
      string dk = "ML_TDD_"  + IntegerToString(MagicNumber);
      if(GlobalVariableCheck(pk)) g_PeakEquity = MathMax(GlobalVariableGet(pk), eq);
      GlobalVariableSet(pk, g_PeakEquity);
      if(GlobalVariableCheck(dk)) g_TotalDDStop = (GlobalVariableGet(dk) > 0.5);
   }

   Print("MultiLogicEA v1.00 gestartet | ", _Symbol, " ", EnumToString((ENUM_TIMEFRAMES)Period()),
         " | Logiken: Trend=", EnableTrendLogic, " Momentum=", EnableMomentumLogic,
         " Breakout=", EnableBreakoutLogic, " MeanRev=", EnableMeanReversion,
         " | MinConfluence=", MinimumConfluence,
         " | Risk=", RiskPercent, "%");
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| OnDeinit                                                          |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   if(h_EmaFast != INVALID_HANDLE) IndicatorRelease(h_EmaFast);
   if(h_EmaMid  != INVALID_HANDLE) IndicatorRelease(h_EmaMid);
   if(h_EmaSlow != INVALID_HANDLE) IndicatorRelease(h_EmaSlow);
   if(h_HtfEma  != INVALID_HANDLE) IndicatorRelease(h_HtfEma);
   if(h_Rsi     != INVALID_HANDLE) IndicatorRelease(h_Rsi);
   if(h_Macd    != INVALID_HANDLE) IndicatorRelease(h_Macd);
   if(h_Bands   != INVALID_HANDLE) IndicatorRelease(h_Bands);
   if(h_Atr     != INVALID_HANDLE) IndicatorRelease(h_Atr);
   if(h_ObvMa   != INVALID_HANDLE) IndicatorRelease(h_ObvMa);
   if(h_Obv     != INVALID_HANDLE) IndicatorRelease(h_Obv);
}

//+------------------------------------------------------------------+
//| OnTick — arbeitet ausschließlich auf abgeschlossenen Bars        |
//+------------------------------------------------------------------+
void OnTick()
{
   datetime barTime = iTime(_Symbol, PERIOD_CURRENT, 0);
   if(barTime == g_LastBarTime) return;
   g_LastBarTime = barTime;

   SyncPositionState();
   CheckDailyReset();
   if(!CheckEquityGuard()) return;

   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);

   //--- Wochenende
   if(dt.day_of_week == 0 || dt.day_of_week == 6) return;

   //--- Freitags-Close
   if(dt.day_of_week == 5 && dt.hour >= FridayCloseHour)
   {
      CloseAllPositions("Freitags-Close");
      return;
   }

   //--- Wochentag-Filter
   if(!IsTradingDayAllowed(dt.day_of_week)) return;

   //--- Handelszeit-Filter
   if(UseSessionFilter && (dt.hour < SessionStartHour || dt.hour >= SessionEndHour)) return;

   //--- Position offen: nichts weiter tun (SL/TP liegen beim Broker)
   if(HasOpenPosition()) return;

   //--- Cooldown prüfen
   if(!IsCooldownPassed()) return;

   //--- Signalprüfung
   EvaluateAndTrade();
}

//+------------------------------------------------------------------+
//| Positions-Status mit dem Konto abgleichen                        |
//+------------------------------------------------------------------+
void SyncPositionState()
{
   if(!HasOpenPosition())
   {
      // Position wurde durch SL oder TP geschlossen
      if(g_TradeDirection != 0 || g_AwaitingExit)
      {
         if(EnableTradeLog && g_TradeDirection != 0)
            Print("Position geschlossen (SL/TP) — Signalsperre aufgehoben.");
         g_TradeDirection = 0;
         g_AwaitingExit   = false;
      }
   }
}

//+------------------------------------------------------------------+
//| Cooldown-Prüfung: genug Bars seit letztem Signal vergangen?      |
//+------------------------------------------------------------------+
bool IsCooldownPassed()
{
   if(g_LastSignalBar == 0) return true;
   if(CooldownBars <= 0)    return true;

   int barsSince = iBarShift(_Symbol, PERIOD_CURRENT, g_LastSignalBar, false);
   return (barsSince > CooldownBars);
}

//+------------------------------------------------------------------+
//| Wochentag erlaubt?                                                |
//+------------------------------------------------------------------+
bool IsTradingDayAllowed(int dayOfWeek)
{
   switch(dayOfWeek)
   {
      case 1: return TradeMonday;
      case 2: return TradeTuesday;
      case 3: return TradeWednesday;
      case 4: return TradeThursday;
      case 5: return TradeFriday;
   }
   return false;
}

//+------------------------------------------------------------------+
//| Session-VWAP für einen bestimmten Bar-Shift berechnen            |
//| Setzt sich zu Beginn jedes Handelstages zurück.                  |
//+------------------------------------------------------------------+
double CalculateSessionVwap(int shift)
{
   datetime barTime = iTime(_Symbol, PERIOD_CURRENT, shift);
   if(barTime == 0) return 0.0;

   MqlDateTime bdt;
   TimeToStruct(barTime, bdt);
   bdt.hour = 0; bdt.min = 0; bdt.sec = 0;
   datetime dayStart = StructToTime(bdt);

   double sumPV = 0.0, sumV = 0.0;

   // Vom aktuellen Bar rückwärts bis zum Tagesbeginn aufsummieren
   for(int i = shift; i < shift + 2000; i++)
   {
      datetime t = iTime(_Symbol, PERIOD_CURRENT, i);
      if(t == 0 || t < dayStart) break;

      double h = iHigh (_Symbol, PERIOD_CURRENT, i);
      double l = iLow  (_Symbol, PERIOD_CURRENT, i);
      double c = iClose(_Symbol, PERIOD_CURRENT, i);
      double v = (double)iTickVolume(_Symbol, PERIOD_CURRENT, i);
      if(v <= 0) v = 1.0;

      double hlc3 = (h + l + c) / 3.0;
      sumPV += hlc3 * v;
      sumV  += v;
   }

   if(sumV <= 0.0) return 0.0;
   return sumPV / sumV;
}

//+------------------------------------------------------------------+
//| Kontext für einen Bar-Shift befüllen                             |
//| shift = 1 → letzte abgeschlossene Kerze                          |
//+------------------------------------------------------------------+
bool FillContext(int shift, SignalContext &ctx)
{
   ctx.valid = false;

   int required = MathMax(SlowEmaLength, MathMax(RangeLength + shift + 3,
                  MathMax(BbLength, MacdSlowLength + MacdSignalLength))) + 10;
   if(Bars(_Symbol, PERIOD_CURRENT) < required) return false;

   //--- Preisdaten
   ctx.open      = iOpen (_Symbol, PERIOD_CURRENT, shift);
   ctx.high      = iHigh (_Symbol, PERIOD_CURRENT, shift);
   ctx.low       = iLow  (_Symbol, PERIOD_CURRENT, shift);
   ctx.close     = iClose(_Symbol, PERIOD_CURRENT, shift);
   ctx.prevClose = iClose(_Symbol, PERIOD_CURRENT, shift + 1);
   if(ctx.close <= 0.0) return false;

   //--- Indikatorpuffer (jeweils 2 Werte ab shift, um Vorgängerwert zu haben)
   double buf[];
   ArraySetAsSeries(buf, true);

   if(CopyBuffer(h_EmaFast, 0, shift, 1, buf) < 1) return false;  ctx.emaFast = buf[0];
   if(CopyBuffer(h_EmaMid,  0, shift, 1, buf) < 1) return false;  ctx.emaMid  = buf[0];
   if(CopyBuffer(h_EmaSlow, 0, shift, 1, buf) < 1) return false;  ctx.emaSlow = buf[0];
   if(CopyBuffer(h_Atr,     0, shift, 1, buf) < 1) return false;  ctx.atr     = buf[0];
   if(CopyBuffer(h_Bands,   0, shift, 1, buf) < 1) return false;  ctx.bbBasis = buf[0];

   if(CopyBuffer(h_Rsi, 0, shift, 2, buf) < 2) return false;
   ctx.rsi     = buf[0];
   ctx.rsiPrev = buf[1];

   double macdMainArr[], macdSigArr[];
   ArraySetAsSeries(macdMainArr, true);
   ArraySetAsSeries(macdSigArr,  true);
   if(CopyBuffer(h_Macd, 0, shift, 2, macdMainArr) < 2) return false;
   if(CopyBuffer(h_Macd, 1, shift, 2, macdSigArr)  < 2) return false;
   ctx.macdMain     = macdMainArr[0];
   ctx.macdSignal   = macdSigArr[0];
   ctx.macdHist     = macdMainArr[0] - macdSigArr[0];
   ctx.macdHistPrev = macdMainArr[1] - macdSigArr[1];

   if(CopyBuffer(h_Obv,   0, shift, 1, buf) < 1) return false;  ctx.obv    = buf[0];
   if(CopyBuffer(h_ObvMa, 0, shift, 1, buf) < 1) return false;  ctx.obvAvg = buf[0];

   //--- HTF EMA (nur abgeschlossene HTF-Bar verwenden, kein Repainting)
   ctx.htfEma = 0.0;
   if(UseHtfFilter)
   {
      datetime barTime = iTime(_Symbol, PERIOD_CURRENT, shift);
      int htfShift = iBarShift(_Symbol, HtfTimeframe, barTime, false);
      if(htfShift < 0) return false;
      if(CopyBuffer(h_HtfEma, 0, htfShift, 1, buf) < 1) return false;
      ctx.htfEma = buf[0];
   }

   //--- VWAP
   ctx.vwap = UseVwapFilter ? CalculateSessionVwap(shift) : 0.0;

   //--- Volumen und Volumen-Durchschnitt
   long volArr[];
   ArraySetAsSeries(volArr, true);
   if(CopyTickVolume(_Symbol, PERIOD_CURRENT, shift, VolumeMaLength + 1, volArr) < VolumeMaLength + 1)
      return false;
   ctx.volume = (double)volArr[0];
   double volSum = 0.0;
   for(int i = 0; i < VolumeMaLength; i++) volSum += (double)volArr[i];
   ctx.volumeAvg = volSum / VolumeMaLength;

   //--- Range-Grenzen: schließen die aktuelle Kerze aus (Pine: [1])
   int rhIdx = iHighest(_Symbol, PERIOD_CURRENT, MODE_HIGH, RangeLength, shift + 1);
   int rlIdx = iLowest (_Symbol, PERIOD_CURRENT, MODE_LOW,  RangeLength, shift + 1);
   if(rhIdx < 0 || rlIdx < 0) return false;
   ctx.priorRangeHigh = iHigh(_Symbol, PERIOD_CURRENT, rhIdx);
   ctx.priorRangeLow  = iLow (_Symbol, PERIOD_CURRENT, rlIdx);

   //--- Range-Grenzen eine Kerze früher (für die Breakout-Kreuzung)
   int prhIdx = iHighest(_Symbol, PERIOD_CURRENT, MODE_HIGH, RangeLength, shift + 2);
   int prlIdx = iLowest (_Symbol, PERIOD_CURRENT, MODE_LOW,  RangeLength, shift + 2);
   if(prhIdx < 0 || prlIdx < 0) return false;
   ctx.prevRangeHigh = iHigh(_Symbol, PERIOD_CURRENT, prhIdx);
   ctx.prevRangeLow  = iLow (_Symbol, PERIOD_CURRENT, prlIdx);

   //--- Swing-Punkte für Struktur-Stop
   int shIdx = iHighest(_Symbol, PERIOD_CURRENT, MODE_HIGH, SwingLookback, shift + 1);
   int slIdx = iLowest (_Symbol, PERIOD_CURRENT, MODE_LOW,  SwingLookback, shift + 1);
   if(shIdx < 0 || slIdx < 0) return false;
   ctx.priorSwingHigh = iHigh(_Symbol, PERIOD_CURRENT, shIdx);
   ctx.priorSwingLow  = iLow (_Symbol, PERIOD_CURRENT, slIdx);

   ctx.valid = true;
   return true;
}

//+------------------------------------------------------------------+
//| Confluence-Score berechnen (je 6 Komponenten)                    |
//+------------------------------------------------------------------+
int BullishScore(const SignalContext &c)
{
   bool bullishTrend = (c.close > c.emaFast && c.emaFast > c.emaMid && c.emaMid > c.emaSlow);
   bool hasVolume    = (c.volumeAvg > 0.0);
   bool highVolume   = hasVolume && (c.volume / c.volumeAvg >= VolumeMultiplier);
   bool obvBullish   = (c.obv > c.obvAvg);

   int score = 0;
   if(bullishTrend)                                    score++;
   if(c.rsi > 45.0 && c.rsi < 72.0)                    score++;
   if(c.macdMain > c.macdSignal && c.macdHist > 0.0)   score++;
   if(c.close > c.bbBasis)                             score++;
   if(hasVolume && highVolume && obvBullish)           score++;
   if(c.close > c.open && c.close > c.priorSwingHigh)  score++;
   return score;
}

int BearishScore(const SignalContext &c)
{
   bool bearishTrend = (c.close < c.emaFast && c.emaFast < c.emaMid && c.emaMid < c.emaSlow);
   bool hasVolume    = (c.volumeAvg > 0.0);
   bool highVolume   = hasVolume && (c.volume / c.volumeAvg >= VolumeMultiplier);
   bool obvBearish   = (c.obv < c.obvAvg);

   int score = 0;
   if(bearishTrend)                                    score++;
   if(c.rsi < 55.0 && c.rsi > 28.0)                    score++;
   if(c.macdMain < c.macdSignal && c.macdHist < 0.0)   score++;
   if(c.close < c.bbBasis)                             score++;
   if(hasVolume && highVolume && obvBearish)           score++;
   if(c.close < c.open && c.close < c.priorSwingLow)   score++;
   return score;
}

//+------------------------------------------------------------------+
//| Setup-Auswertung: liefert true wenn ein Long-Setup aktiv ist     |
//+------------------------------------------------------------------+
bool IsBuySetup(const SignalContext &c)
{
   if(!c.valid) return false;

   //--- Basiszustände
   bool bullishTrend = (c.close > c.emaFast && c.emaFast > c.emaMid && c.emaMid > c.emaSlow);
   bool bearishTrend = (c.close < c.emaFast && c.emaFast < c.emaMid && c.emaMid < c.emaSlow);

   bool hasVolume  = (c.volumeAvg > 0.0);
   bool highVolume = hasVolume && (c.volume / c.volumeAvg >= VolumeMultiplier);
   bool volumeGate = (!UseVolumeFilter || !hasVolume || highVolume);
   bool obvBullish = (c.obv > c.obvAvg);

   bool htfLongOk  = (!UseHtfFilter  || (c.htfEma > 0.0 && c.close > c.htfEma));
   bool vwapLongOk = (!UseVwapFilter || (c.vwap   > 0.0 && c.close > c.vwap));

   double rangeWidth = c.priorRangeHigh - c.priorRangeLow;
   double rangePct   = (c.priorRangeLow != 0.0) ? rangeWidth / c.priorRangeLow * 100.0 : 0.0;
   bool priorWasRange = (rangePct <= RangeThresholdPct);
   bool sidewaysMarket = priorWasRange && !bullishTrend && !bearishTrend;

   double candleHL = c.high - c.low;
   bool candleValid = (candleHL > 0.0);
   double closePos = candleValid ? (c.close - c.low) / candleHL : 0.0;

   //--- Logik 1: Trend-Following
   if(EnableTrendLogic && bullishTrend &&
      BullishScore(c) >= MinimumConfluence && htfLongOk && vwapLongOk)
      return true;

   //--- Logik 2: Momentum
   if(EnableMomentumLogic &&
      c.close > c.emaFast &&
      c.rsi > 52.0 &&
      c.macdHist > 0.0 &&
      c.macdHist > c.macdHistPrev &&
      obvBullish && volumeGate && htfLongOk && vwapLongOk)
      return true;

   //--- Logik 3: Range-Breakout
   bool breakoutVolumeOk = (!RequireVolumeForBreakout || !hasVolume || highVolume);
   if(EnableBreakoutLogic && priorWasRange &&
      c.close > c.priorRangeHigh + c.atr * BreakoutAtrBuffer &&
      c.prevClose <= c.prevRangeHigh &&
      candleValid && closePos >= BreakoutMinClosePosition &&
      c.rsi > 50.0 &&
      c.macdMain > c.macdSignal &&
      volumeGate && breakoutVolumeOk && vwapLongOk)
      return true;

   //--- Logik 4: Mean-Reversion (Seitwärtsmarkt)
   if(EnableMeanReversion && sidewaysMarket)
   {
      double lowerZone = c.priorRangeLow + rangeWidth * 0.20;
      bool rangeWideEnough = (rangeWidth >= c.atr * MinRangeAtrRatio);
      bool rejectionWick   = candleValid &&
                             ((MathMin(c.open, c.close) - c.low) / candleHL >= ReversionWickRatio);
      bool rsiTurningUp    = (!RequireRsiTurnForReversion || c.rsi > c.rsiPrev);

      if(rangeWideEnough &&
         c.low <= lowerZone && c.close > lowerZone &&
         c.close > c.open && rejectionWick &&
         c.rsi < 38.0 && rsiTurningUp && volumeGate)
         return true;
   }

   return false;
}

//+------------------------------------------------------------------+
//| Setup-Auswertung: liefert true wenn ein Short-Setup aktiv ist    |
//+------------------------------------------------------------------+
bool IsSellSetup(const SignalContext &c)
{
   if(!c.valid) return false;

   bool bullishTrend = (c.close > c.emaFast && c.emaFast > c.emaMid && c.emaMid > c.emaSlow);
   bool bearishTrend = (c.close < c.emaFast && c.emaFast < c.emaMid && c.emaMid < c.emaSlow);

   bool hasVolume  = (c.volumeAvg > 0.0);
   bool highVolume = hasVolume && (c.volume / c.volumeAvg >= VolumeMultiplier);
   bool volumeGate = (!UseVolumeFilter || !hasVolume || highVolume);
   bool obvBearish = (c.obv < c.obvAvg);

   bool htfShortOk  = (!UseHtfFilter  || (c.htfEma > 0.0 && c.close < c.htfEma));
   bool vwapShortOk = (!UseVwapFilter || (c.vwap   > 0.0 && c.close < c.vwap));

   double rangeWidth = c.priorRangeHigh - c.priorRangeLow;
   double rangePct   = (c.priorRangeLow != 0.0) ? rangeWidth / c.priorRangeLow * 100.0 : 0.0;
   bool priorWasRange = (rangePct <= RangeThresholdPct);
   bool sidewaysMarket = priorWasRange && !bullishTrend && !bearishTrend;

   double candleHL = c.high - c.low;
   bool candleValid = (candleHL > 0.0);
   double closePos = candleValid ? (c.close - c.low) / candleHL : 0.0;

   //--- Logik 1: Trend-Following
   if(EnableTrendLogic && bearishTrend &&
      BearishScore(c) >= MinimumConfluence && htfShortOk && vwapShortOk)
      return true;

   //--- Logik 2: Momentum
   if(EnableMomentumLogic &&
      c.close < c.emaFast &&
      c.rsi < 48.0 &&
      c.macdHist < 0.0 &&
      c.macdHist < c.macdHistPrev &&
      obvBearish && volumeGate && htfShortOk && vwapShortOk)
      return true;

   //--- Logik 3: Range-Breakout
   bool breakoutVolumeOk = (!RequireVolumeForBreakout || !hasVolume || highVolume);
   if(EnableBreakoutLogic && priorWasRange &&
      c.close < c.priorRangeLow - c.atr * BreakoutAtrBuffer &&
      c.prevClose >= c.prevRangeLow &&
      candleValid && closePos <= (1.0 - BreakoutMinClosePosition) &&
      c.rsi < 50.0 &&
      c.macdMain < c.macdSignal &&
      volumeGate && breakoutVolumeOk && vwapShortOk)
      return true;

   //--- Logik 4: Mean-Reversion
   if(EnableMeanReversion && sidewaysMarket)
   {
      double upperZone = c.priorRangeHigh - rangeWidth * 0.20;
      bool rangeWideEnough = (rangeWidth >= c.atr * MinRangeAtrRatio);
      bool rejectionWick   = candleValid &&
                             ((c.high - MathMax(c.open, c.close)) / candleHL >= ReversionWickRatio);
      bool rsiTurningDown  = (!RequireRsiTurnForReversion || c.rsi < c.rsiPrev);

      if(rangeWideEnough &&
         c.high >= upperZone && c.close < upperZone &&
         c.close < c.open && rejectionWick &&
         c.rsi > 62.0 && rsiTurningDown && volumeGate)
         return true;
   }

   return false;
}

//+------------------------------------------------------------------+
//| Signalauswertung und Orderausführung                             |
//+------------------------------------------------------------------+
void EvaluateAndTrade()
{
   SignalContext cur, prev;
   if(!FillContext(1, cur))  return;

   //--- "Fresh Setup" braucht den Zustand der Vorgängerkerze
   bool prevBuy = false, prevSell = false;
   if(FreshSetupOnly)
   {
      if(!FillContext(2, prev)) return;
      prevBuy  = IsBuySetup(prev);
      prevSell = IsSellSetup(prev);
   }

   bool rawBuy  = IsBuySetup(cur);
   bool rawSell = IsSellSetup(cur);

   bool buyTrigger  = FreshSetupOnly ? (rawBuy  && !prevBuy)  : rawBuy;
   bool sellTrigger = FreshSetupOnly ? (rawSell && !prevSell) : rawSell;

   //--- Signalsperre: auf SL/TP warten
   bool longAllowed, shortAllowed;
   if(RequireExitBeforeNextSignal)
   {
      longAllowed  = !g_AwaitingExit;
      shortAllowed = !g_AwaitingExit;
   }
   else
   {
      longAllowed  = (AllowOppositeSignal || g_TradeDirection >= 0);
      shortAllowed = (AllowOppositeSignal || g_TradeDirection <= 0);
   }

   bool buyCandidate  = buyTrigger  && longAllowed;
   bool sellCandidate = sellTrigger && shortAllowed;

   //--- Konflikt auflösen: der höhere Score gewinnt
   int bullScore = BullishScore(cur);
   int bearScore = BearishScore(cur);
   bool buySignal  = buyCandidate  && (!sellCandidate || bullScore > bearScore);
   bool sellSignal = sellCandidate && (!buyCandidate  || bearScore > bullScore);

   if(buySignal)  ExecuteLong(cur, bullScore);
   else if(sellSignal) ExecuteShort(cur, bearScore);
}

//+------------------------------------------------------------------+
//| Long-Position eröffnen                                            |
//+------------------------------------------------------------------+
void ExecuteLong(const SignalContext &c, int score)
{
   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   if(ask <= 0.0) return;

   //--- Stop-Loss nach gewählter Methode
   double fallbackStop  = ask - c.atr * StopAtrMultiplier;
   double structureStop = c.priorSwingLow - c.atr * StructureAtrBuffer;

   double sl;
   if(StopMethod == STOP_ATR)            sl = fallbackStop;
   else if(StopMethod == STOP_FIXED_PCT) sl = ask * (1.0 - FixedStopPct / 100.0);
   else                                  sl = structureStop;

   // Ungültiger Stop (über dem Einstieg) fällt auf den ATR-Stop zurück
   if(sl >= ask) sl = fallbackStop;
   if(sl >= ask) return;

   double risk = ask - sl;

   //--- Take-Profit nach gewählter Methode
   double tp;
   if(TargetMethod == TARGET_ATR)             tp = ask + c.atr * TargetAtrMultiplier;
   else if(TargetMethod == TARGET_FIXED_PCT)  tp = ask * (1.0 + FixedTargetPct / 100.0);
   else                                       tp = ask + risk * RiskRewardRatio;

   //--- Mindestabstand des Brokers beachten
   long stopsLvl = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
   double minDist = stopsLvl * _Point;
   if(risk <= minDist || (tp - ask) <= minDist)
   {
      if(EnableTradeLog) Print("LONG verworfen: SL/TP-Abstand unter Broker-Minimum.");
      return;
   }

   double lot = CalcLot(risk);
   if(lot <= 0.0) return;

   sl = NormalizeDouble(sl, _Digits);
   tp = NormalizeDouble(tp, _Digits);

   if(Trade.Buy(lot, _Symbol, 0.0, sl, tp, EAComment))
   {
      g_TradeDirection = 1;
      g_AwaitingExit   = true;
      g_LastSignalBar  = iTime(_Symbol, PERIOD_CURRENT, 1);

      if(EnableTradeLog)
         Print("=== LONG === Entry:", DoubleToString(ask, _Digits),
               " SL:", DoubleToString(sl, _Digits),
               " TP:", DoubleToString(tp, _Digits),
               " Lot:", DoubleToString(lot, 2),
               " Risk:", DoubleToString(risk / _Point, 0), "pts",
               " BullScore:", score, "/6");
      if(EnableAlerts) Alert("MultiLogicEA LONG: ", _Symbol);
   }
   else if(EnableTradeLog)
      Print("LONG fehlgeschlagen: ", Trade.ResultRetcodeDescription());
}

//+------------------------------------------------------------------+
//| Short-Position eröffnen                                           |
//+------------------------------------------------------------------+
void ExecuteShort(const SignalContext &c, int score)
{
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   if(bid <= 0.0) return;

   double fallbackStop  = bid + c.atr * StopAtrMultiplier;
   double structureStop = c.priorSwingHigh + c.atr * StructureAtrBuffer;

   double sl;
   if(StopMethod == STOP_ATR)            sl = fallbackStop;
   else if(StopMethod == STOP_FIXED_PCT) sl = bid * (1.0 + FixedStopPct / 100.0);
   else                                  sl = structureStop;

   if(sl <= bid) sl = fallbackStop;
   if(sl <= bid) return;

   double risk = sl - bid;

   double tp;
   if(TargetMethod == TARGET_ATR)             tp = bid - c.atr * TargetAtrMultiplier;
   else if(TargetMethod == TARGET_FIXED_PCT)  tp = bid * (1.0 - FixedTargetPct / 100.0);
   else                                       tp = bid - risk * RiskRewardRatio;

   long stopsLvl = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
   double minDist = stopsLvl * _Point;
   if(risk <= minDist || (bid - tp) <= minDist)
   {
      if(EnableTradeLog) Print("SHORT verworfen: SL/TP-Abstand unter Broker-Minimum.");
      return;
   }

   double lot = CalcLot(risk);
   if(lot <= 0.0) return;

   sl = NormalizeDouble(sl, _Digits);
   tp = NormalizeDouble(tp, _Digits);

   if(Trade.Sell(lot, _Symbol, 0.0, sl, tp, EAComment))
   {
      g_TradeDirection = -1;
      g_AwaitingExit   = true;
      g_LastSignalBar  = iTime(_Symbol, PERIOD_CURRENT, 1);

      if(EnableTradeLog)
         Print("=== SHORT === Entry:", DoubleToString(bid, _Digits),
               " SL:", DoubleToString(sl, _Digits),
               " TP:", DoubleToString(tp, _Digits),
               " Lot:", DoubleToString(lot, 2),
               " Risk:", DoubleToString(risk / _Point, 0), "pts",
               " BearScore:", score, "/6");
      if(EnableAlerts) Alert("MultiLogicEA SHORT: ", _Symbol);
   }
   else if(EnableTradeLog)
      Print("SHORT fehlgeschlagen: ", Trade.ResultRetcodeDescription());
}

//+------------------------------------------------------------------+
//| Lot-Berechnung aus Risiko-Prozentsatz und Stop-Distanz           |
//+------------------------------------------------------------------+
double CalcLot(double slDist)
{
   double base = RiskOnFixedBal ? FixedBalanceRef : AccountInfoDouble(ACCOUNT_BALANCE);
   double rAmt = base * RiskPercent / 100.0;
   double tv   = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   double ts   = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   if(tv <= 0.0 || ts <= 0.0 || slDist <= 0.0) return 0.0;

   double lot = rAmt / (slDist / ts * tv);
   lot = MathMin(lot, MaxLotsPerTrade);

   double mn = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double mx = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   double st = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   if(st <= 0.0) st = 0.01;

   lot = MathMax(MathMin(lot, mx), mn);
   return NormalizeDouble(MathRound(lot / st) * st, 2);
}

//+------------------------------------------------------------------+
//| Offene Position dieses EAs vorhanden?                            |
//+------------------------------------------------------------------+
bool HasOpenPosition()
{
   int total = PositionsTotal();
   for(int i = 0; i < total; i++)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      if(PositionGetString(POSITION_SYMBOL)  != _Symbol)     continue;
      if(PositionGetInteger(POSITION_MAGIC)  != MagicNumber) continue;
      return true;
   }
   return false;
}

//+------------------------------------------------------------------+
//| Alle Positionen dieses EAs schließen                             |
//+------------------------------------------------------------------+
void CloseAllPositions(string reason)
{
   int total = PositionsTotal();
   for(int i = total - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      if(PositionGetString(POSITION_SYMBOL)  != _Symbol)     continue;
      if(PositionGetInteger(POSITION_MAGIC)  != MagicNumber) continue;
      if(Trade.PositionClose(ticket))
      {
         g_TradeDirection = 0;
         g_AwaitingExit   = false;
         if(EnableTradeLog) Print("Geschlossen (", reason, "): Ticket ", ticket);
      }
   }
}

//+------------------------------------------------------------------+
//| Equity-Schutz (Tages- und Gesamt-Drawdown)                       |
//+------------------------------------------------------------------+
bool CheckEquityGuard()
{
   if(!EnableEquityGuard) return true;

   double eq = AccountInfoDouble(ACCOUNT_EQUITY);
   if(eq > g_PeakEquity)
   {
      g_PeakEquity = eq;
      GlobalVariableSet("ML_Peak_" + IntegerToString(MagicNumber), g_PeakEquity);
   }

   double tdd = (g_PeakEquity > 0.0) ? (g_PeakEquity - eq) / g_PeakEquity * 100.0 : 0.0;
   if(tdd >= MaxTotalDrawdown && !g_TotalDDStop)
   {
      g_TotalDDStop = true;
      GlobalVariableSet("ML_TDD_" + IntegerToString(MagicNumber), 1.0);
      CloseAllPositions("Gesamt-DD-Limit");
      Print("KRITISCH: Gesamt-Drawdown ", MaxTotalDrawdown, "% erreicht. EA gestoppt.");
      if(EnableAlerts) Alert("MultiLogicEA: Gesamt-DD erreicht!");
   }
   if(g_TotalDDStop) return false;
   if(g_DailyStop)   return false;

   double ddd = (g_DayStartEquity > 0.0) ? (g_DayStartEquity - eq) / g_DayStartEquity * 100.0 : 0.0;
   if(ddd >= MaxDailyLossPercent)
   {
      g_DailyStop = true;
      CloseAllPositions("Tages-DD-Limit");
      Print("Tages-Drawdown ", MaxDailyLossPercent, "% erreicht. Pause bis morgen.");
      return false;
   }
   return true;
}

//+------------------------------------------------------------------+
//| Tages-Reset                                                       |
//+------------------------------------------------------------------+
void CheckDailyReset()
{
   MqlDateTime n, l;
   TimeToStruct(TimeCurrent(), n);
   TimeToStruct(g_LastDayCheck, l);
   if(n.day != l.day || n.mon != l.mon || n.year != l.year)
   {
      g_DayStartEquity = AccountInfoDouble(ACCOUNT_EQUITY);
      g_DailyStop      = false;
      g_LastDayCheck   = TimeCurrent();
   }
}
//+------------------------------------------------------------------+
//| ENDE DER DATEI                                                    |
//+------------------------------------------------------------------+

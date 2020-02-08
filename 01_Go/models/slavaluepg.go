package models

func (b *Blog) AddSLAValues(pSLAValues *SLAValues) error {
	return b.DBConn.Insert(pSLAValues)
}

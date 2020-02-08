package models

func (b *Blog) AddSLAPriority(pPriority *SLAPriority) error {
	return b.DBConn.Insert(pPriority)
}
